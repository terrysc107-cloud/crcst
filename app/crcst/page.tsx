'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Quiz from '@/components/Quiz'
import Results from '@/components/Results'
import ChatBot from '@/components/ChatBot'
import { QUESTIONS, type Question } from '@/lib/questions'

type Screen = 'home' | 'quiz' | 'results' | 'auth' | 'custom'
type QuizMode = 'practice' | 'flashcards' | 'mock' | 'custom'

interface QuizData {
  questions: Question[]
  currentIndex: number
  answers: (number | null)[]
  startTime: number
}

interface Stats {
  answered: number
  correct: number
  accuracy: number
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('auth')
  const [user, setUser] = useState<any>(null)
  const [mode, setMode] = useState<QuizMode>('practice')
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [results, setResults] = useState<any>(null)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState('all')
  const [customQuestionCount, setCustomQuestionCount] = useState(25)
  const [stats, setStats] = useState<Stats>({ answered: 0, correct: 0, accuracy: 0 })
  const [domainMastery, setDomainMastery] = useState<Record<string, { correct: number; total: number }>>({})
  const [streak, setStreak] = useState(0)
  const [pausedSessions, setPausedSessions] = useState<any[]>([])

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setScreen('home')
        loadStats(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        setScreen('home')
        loadStats(session.user.id)
      } else {
        setUser(null)
        setScreen('auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadStats = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('crcst_quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (data && data.length > 0) {
        const totalQuestions = data.reduce((sum, r) => sum + r.total_questions, 0)
        const totalCorrect = data.reduce((sum, r) => sum + r.score, 0)
        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
        setStats({ answered: totalQuestions, correct: totalCorrect, accuracy })

        // Calculate domain mastery from domains array in each result
        const masterySummary: Record<string, { correct: number; total: number }> = {}
        data.forEach((result) => {
          if (result.domains && Array.isArray(result.domains)) {
            result.domains.forEach((domain: any) => {
              if (!masterySummary[domain.name]) {
                masterySummary[domain.name] = { correct: 0, total: 0 }
              }
              masterySummary[domain.name].correct += domain.correct || 0
              masterySummary[domain.name].total += domain.total || 0
            })
          }
        })
        setDomainMastery(masterySummary)

        // Calculate streak (consecutive days with quiz activity)
        const uniqueDays = [...new Set(data.map((r) => {
          const date = new Date(r.created_at)
          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        }))].sort().reverse()
        
        let currentStreak = 0
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`
        
        // Check if user studied today or yesterday
        if (uniqueDays[0] === todayStr || uniqueDays[0] === yesterdayStr) {
          currentStreak = 1
          let checkDate = new Date(uniqueDays[0] === todayStr ? today : yesterday)
          
          for (let i = 1; i < uniqueDays.length; i++) {
            checkDate.setDate(checkDate.getDate() - 1)
            const checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
            if (uniqueDays[i] === checkStr) {
              currentStreak++
            } else {
              break
            }
          }
        }
        setStreak(currentStreak)
      }

      // Always load paused sessions when stats refresh
      const { data: sessions } = await supabase
        .from('crcst_quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_paused', true)

      if (sessions) setPausedSessions(sessions)

    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const saveResults = async (quizResults: any) => {
    if (!user) return

    // Calculate domain scores
    const domainScores: Record<string, { correct: number; total: number }> = {}
    quizResults.questions?.forEach((q: Question, i: number) => {
      if (!domainScores[q.domain]) {
        domainScores[q.domain] = { correct: 0, total: 0 }
      }
      domainScores[q.domain].total++
      if (quizResults.answers?.[i] === q.correct_answer) {
        domainScores[q.domain].correct++
      }
    })

    try {
      await supabase.from('crcst_quiz_results').insert({
        user_id: user.id,
        difficulty: quizResults.mode,
        score: quizResults.correct,
        total_questions: quizResults.total,
        percentage: quizResults.percentage,
        time_taken: quizResults.elapsed,
        domains: Object.entries(domainScores).map(([name, stats]) => ({
          name,
          correct: stats.correct,
          total: stats.total,
          percentage: Math.round((stats.correct / stats.total) * 100)
        })),
      })
      loadStats(user.id)
    } catch (error) {
      console.error('Error saving results:', error)
    }
  }

  const savePausedSession = async (sessionData: any) => {
    if (!user) return
    try {
      const { error } = await supabase.from('crcst_quiz_sessions').insert({
        user_id: user.id,
        quiz_mode: sessionData.mode,
        question_ids: sessionData.questionIds,
        answers: sessionData.answers,
        current_question_index: sessionData.currentQuestionIndex,
        selected_domains: selectedDomains,
        difficulty,
        elapsed_time_seconds: sessionData.elapsedTimeSeconds,
        is_paused: true,
      })

      if (!error) {
        // Refresh paused sessions list
        const { data: sessions } = await supabase
          .from('crcst_quiz_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_paused', true)
        if (sessions) setPausedSessions(sessions)
      }
    } catch (error) {
      console.error('Error saving paused session:', error)
    }
  }

  const resumeSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('crcst_quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (data && !error) {
        // Get the original questions by ID
        const questionIds = data.question_ids as string[]
        const resumeQuestions = QUESTIONS.filter((q) => questionIds.includes(q.id))

        setQuizData({
          questions: resumeQuestions,
          currentIndex: data.current_question_index || 0,
          answers: data.answers || new Array(resumeQuestions.length).fill(null),
          startTime: Date.now() - (data.elapsed_time_seconds * 1000), // Adjust for elapsed time
        })
        setMode(data.quiz_mode)
        setScreen('quiz')

        // Delete the session from DB
        await supabase.from('crcst_quiz_sessions').delete().eq('id', sessionId)
      }
    } catch (error) {
      console.error('Error resuming session:', error)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!user) return
    try {
      await supabase.from('crcst_quiz_sessions').delete().eq('id', sessionId)
      const { data: sessions } = await supabase
        .from('crcst_quiz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_paused', true)
      if (sessions) setPausedSessions(sessions)
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const startQuiz = (quizMode: QuizMode, domains?: string[], diff?: string) => {
    let questions = [...QUESTIONS]

    // Filter by domains
    if (domains && domains.length > 0) {
      questions = questions.filter((q) => domains.includes(q.domain))
    }

    // Filter by difficulty
    if (diff && diff !== 'all') {
      questions = questions.filter((q) => q.difficulty === diff)
    }

    // Shuffle questions
    questions = questions.sort(() => Math.random() - 0.5)

    // Select number of questions based on mode
    let selected = questions
    if (quizMode === 'practice') selected = questions.slice(0, 20)
    if (quizMode === 'mock') selected = questions.slice(0, 50)
    if (quizMode === 'flashcards') selected = questions.slice(0, 25)
    if (quizMode === 'custom') selected = questions.slice(0, customQuestionCount)

    setMode(quizMode)
    setQuizData({
      questions: selected,
      currentIndex: 0,
      answers: new Array(selected.length).fill(null),
      startTime: Date.now(),
    })
    setScreen('quiz')
  }

  const handleQuizComplete = (quizResults: any) => {
    setResults(quizResults)
    setScreen('results')
    saveResults(quizResults)
  }

  const getDomains = () => {
    return Array.from(new Set(QUESTIONS.map((q) => q.domain)))
  }

  const getDomainMasteryPercentage = (domain: string) => {
    const mastery = domainMastery[domain]
    if (!mastery || mastery.total === 0) return 0
    return Math.round((mastery.correct / mastery.total) * 100)
  }

  // Auth Screen
  if (screen === 'auth') {
    return <AuthScreen />
  }

  // Quiz Screen
  if (screen === 'quiz' && quizData) {
    return (
      <div className="min-h-screen bg-cream">
        <Header user={user} streak={streak} />
        <Quiz
          quizData={quizData}
          mode={mode}
          onComplete={handleQuizComplete}
          onExit={() => setScreen('home')}
          onPause={savePausedSession}
          user={user}
        />
        <ChatBot />
      </div>
    )
  }

  // Results Screen
  if (screen === 'results' && results) {
    return (
      <div className="min-h-screen bg-cream">
        <Header user={user} streak={streak} />
        <Results
          results={results}
          onRetry={() => startQuiz(mode, selectedDomains, difficulty)}
          onHome={() => setScreen('home')}
        />
        <ChatBot />
      </div>
    )
  }

  // Custom Quiz Builder Screen
  if (screen === 'custom') {
    return (
      <div className="min-h-screen bg-cream">
        <Header user={user} streak={streak} />
        <CustomQuizBuilder
          domains={getDomains()}
          selectedDomains={selectedDomains}
          setSelectedDomains={setSelectedDomains}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          questionCount={customQuestionCount}
          setQuestionCount={setCustomQuestionCount}
          onStart={() => startQuiz('custom', selectedDomains, difficulty)}
          onBack={() => setScreen('home')}
        />
        <ChatBot />
      </div>
    )
  }

  // Home Screen
  return (
    <div className="min-h-screen bg-cream">
      <Header user={user} streak={streak} />
      <div className="max-w-2xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-navy to-navy-2 text-white px-6 py-12">
          <div className="text-xs tracking-widest text-teal-3 mb-3">
            STERILE PROCESSING CERTIFICATION
          </div>
          <h1 className="font-serif text-4xl mb-2 text-balance">
            Pass your <em className="text-amber">CRCST</em> exam with confidence.
          </h1>
          <p className="text-sm text-teal-3 mb-8">
            {QUESTIONS.length} verified questions from your actual course materials
          </p>

          {/* Readiness Card */}
          <div className="bg-white/10 border border-teal-3/20 rounded-lg p-4 mb-6 flex justify-between items-center">
            <div>
              <div className="text-xs text-teal-3 tracking-widest mb-1">
                EXAM READINESS SCORE
              </div>
              <div className="font-serif text-lg text-white">
                {stats.accuracy >= 80
                  ? 'Exam Ready!'
                  : stats.accuracy >= 60
                  ? 'Almost There'
                  : stats.answered > 0
                  ? 'Developing'
                  : 'Not Started'}
              </div>
            </div>
            <div className="text-right">
              <div className="font-serif text-4xl text-amber">
                {stats.accuracy}%
              </div>
              <div className="text-xs text-navy-3">
                {stats.answered === 0 ? 'Not started' : `${stats.answered} questions`}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex">
            <div className="flex-1 text-center py-2 bg-white/5 border-r border-white/10">
              <div className="font-serif text-2xl text-amber">{QUESTIONS.length}</div>
              <div className="text-xs text-navy-3 uppercase tracking-wider">
                Questions
              </div>
            </div>
            <div className="flex-1 text-center py-2 bg-white/5 border-r border-white/10">
              <div className="font-serif text-2xl text-amber">{stats.answered}</div>
              <div className="text-xs text-navy-3 uppercase tracking-wider">
                Answered
              </div>
            </div>
            <div className="flex-1 text-center py-2 bg-white/5">
              <div className="font-serif text-2xl text-amber">{stats.accuracy}%</div>
              <div className="text-xs text-navy-3 uppercase tracking-wider">
                Accuracy
              </div>
            </div>
          </div>
        </div>

        {/* Study Modes */}
        <div className="px-6 py-8">
          <div className="text-xs tracking-widest text-text-3 mb-4">
            CHOOSE A STUDY MODE
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              {
                icon: '📚',
                name: 'Practice Quiz',
                desc: '20 questions with instant feedback',
                mode: 'practice' as QuizMode,
              },
              {
                icon: '⚡',
                name: 'Flashcards',
                desc: 'Flip through 25 cards',
                mode: 'flashcards' as QuizMode,
              },
              {
                icon: '🎯',
                name: 'Mock Exam',
                desc: 'Timed 50-question simulation',
                mode: 'mock' as QuizMode,
              },
              {
                icon: '⚙️',
                name: 'Custom Quiz',
                desc: 'Build your own quiz',
                mode: 'custom' as QuizMode,
              },
            ].map(({ icon, name, desc, mode: m }) => (
              <button
                key={m}
                onClick={() => {
                  if (m === 'custom') {
                    setScreen('custom')
                  } else {
                    startQuiz(m)
                  }
                }}
                className="bg-white border-2 border-cream-2 rounded-lg p-4 hover:border-teal hover:shadow-lg transition text-left"
              >
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-serif text-navy font-bold text-sm">{name}</div>
                <div className="text-xs text-text-3 mt-1">{desc}</div>
              </button>
            ))}
          </div>

          {/* Resume Quiz Section */}
          {pausedSessions && pausedSessions.length > 0 && (
            <div className="mb-8">
              <div className="text-xs tracking-widest text-text-3 mb-4 flex items-center gap-2">
                <span>⏸ PAUSED QUIZZES</span>
              </div>
              <div className="space-y-2">
                {pausedSessions.map((session) => {
                  const progress = Math.round(
                    ((session.current_question_index + 1) / session.question_ids.length) * 100
                  )
                  const mode = session.quiz_mode.charAt(0).toUpperCase() + session.quiz_mode.slice(1)
                  return (
                    <div
                      key={session.id}
                      className="bg-white border-2 border-amber rounded-lg p-4 flex justify-between items-center hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        <div className="font-serif text-navy font-bold mb-1">{mode}</div>
                        <div className="text-xs text-text-3 mb-2">
                          {session.current_question_index + 1} / {session.question_ids.length} questions
                        </div>
                        <div className="w-24 h-1 bg-cream-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => resumeSession(session.id)}
                          className="px-4 py-2 bg-teal text-white rounded-lg text-xs font-mono hover:bg-teal-2 transition"
                        >
                          Resume
                        </button>
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="px-3 py-2 text-wrong hover:bg-wrong/10 rounded-lg text-xs transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Domain Mastery */}
          <div className="text-xs tracking-widest text-text-3 mb-4">
            DOMAIN MASTERY
          </div>
          <div className="grid grid-cols-2 gap-3">
            {getDomains().map((domain) => {
              const pct = getDomainMasteryPercentage(domain)
              const mastery = domainMastery[domain]
              return (
                <div
                  key={domain}
                  className="bg-white rounded-lg p-3 border border-cream-2"
                >
                  <div className="font-serif text-sm text-navy font-bold mb-2 truncate">
                    {domain}
                  </div>
                  <div className="w-full h-1.5 bg-cream-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 70 ? 'bg-correct' : pct >= 40 ? 'bg-amber' : 'bg-teal'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-text-3 mt-1">
                    {pct}% ({mastery?.total || 0} questions)
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <ChatBot />
    </div>
  )
}

// Auth Screen Component
function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [targetCert, setTargetCert] = useState('')
  const [examTimeline, setExamTimeline] = useState('')
  const [experience, setExperience] = useState('')
  const [referralSource, setReferralSource] = useState('')

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // If email confirmation is disabled, user is auto-confirmed and session is returned
        if (data.session && data.user) {
          // Save profile data
          await supabase.from('profiles').upsert({
            id: data.user.id,
            target_cert: targetCert || null,
            exam_timeline: examTimeline || null,
            years_experience: experience || null,
            referral_source: referralSource || null,
          })
          // User is already logged in, no confirmation needed
          setUser(data.user)
          setScreen('home')
          loadStats(data.user.id)
        } else {
          // Email confirmation is enabled, show message
          setMessage('Check your email to confirm your account!')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: any) {
      const message = err.message || 'Authentication failed'
      if (message.toLowerCase().includes('rate limit')) {
        setError('Too many attempts. Please wait a few minutes and try again.')
      } else if (message.toLowerCase().includes('already registered')) {
        setError('This email is already registered. Try signing in instead.')
      } else if (message.toLowerCase().includes('invalid login')) {
        setError('Invalid email or password. Please try again.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-2 to-navy flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <h1 className="font-serif text-2xl text-navy mb-2 text-center">
          SPD Cert <em className="text-amber">Companion</em>
        </h1>
        <p className="text-xs text-center text-text-3 tracking-widest mb-6">
          Master CRCST Certification
        </p>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-6 border-b border-cream-2">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-3 text-xs tracking-widest border-b-2 transition ${
              !isSignUp
                ? 'border-teal text-teal'
                : 'border-transparent text-text-3'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-3 text-xs tracking-widest border-b-2 transition ${
              isSignUp
                ? 'border-teal text-teal'
                : 'border-transparent text-text-3'
            }`}
          >
            SIGN UP
          </button>
        </div>

        {/* Form */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-cream-2 rounded-lg mb-3 text-sm font-mono focus:outline-none focus:border-teal"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
          className="w-full px-4 py-3 border border-cream-2 rounded-lg mb-3 text-sm font-mono focus:outline-none focus:border-teal"
        />

        {isSignUp && (
          <>
            <select
              value={targetCert}
              onChange={e => setTargetCert(e.target.value)}
              className="w-full px-4 py-3 border border-cream-2 rounded-lg mb-3 text-sm font-mono focus:outline-none focus:border-teal bg-white"
            >
              <option value="">Which cert are you studying for?</option>
              <option value="CRCST">CRCST — Central Service Technician</option>
              <option value="CHL">CHL — Healthcare Leader</option>
              <option value="CER">CER — Endoscope Reprocessor</option>
              <option value="unsure">Not sure yet</option>
            </select>

            <select
              value={examTimeline}
              onChange={e => setExamTimeline(e.target.value)}
              className="w-full px-4 py-3 border border-cream-2 rounded-lg mb-3 text-sm font-mono focus:outline-none focus:border-teal bg-white"
            >
              <option value="">When is your exam?</option>
              <option value="30days">Within 30 days</option>
              <option value="1to3months">1–3 months</option>
              <option value="3to6months">3–6 months</option>
              <option value="nodateyet">No date set yet</option>
            </select>

            <select
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full px-4 py-3 border border-cream-2 rounded-lg mb-3 text-sm font-mono focus:outline-none focus:border-teal bg-white"
            >
              <option value="">Years in sterile processing?</option>
              <option value="entry">Less than 1 year</option>
              <option value="early">1–3 years</option>
              <option value="mid">3–5 years</option>
              <option value="senior">5+ years</option>
            </select>

            <select
              value={referralSource}
              onChange={e => setReferralSource(e.target.value)}
              className="w-full px-4 py-3 border border-cream-2 rounded-lg mb-4 text-sm font-mono focus:outline-none focus:border-teal bg-white"
            >
              <option value="">How did you hear about us?</option>
              <option value="coworker">Coworker or colleague</option>
              <option value="socialmedia">Social media</option>
              <option value="google">Google search</option>
              <option value="instructor">Instructor or educator</option>
              <option value="conference">HSPA / Conference</option>
              <option value="other">Other</option>
            </select>
          </>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-teal text-white py-3 rounded-lg font-mono text-sm tracking-widest hover:bg-teal-2 disabled:opacity-50 transition"
        >
          {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        {error && (
          <p className="text-xs text-center mt-3 text-wrong">{error}</p>
        )}
        {message && (
          <p className="text-xs text-center mt-3 text-correct">{message}</p>
        )}

        <p className="text-xs text-center text-text-3 mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  )
}

// Custom Quiz Builder Component
function CustomQuizBuilder({
  domains,
  selectedDomains,
  setSelectedDomains,
  difficulty,
  setDifficulty,
  questionCount,
  setQuestionCount,
  onStart,
  onBack,
}: {
  domains: string[]
  selectedDomains: string[]
  setSelectedDomains: (domains: string[]) => void
  difficulty: string
  setDifficulty: (diff: string) => void
  questionCount: number
  setQuestionCount: (count: number) => void
  onStart: () => void
  onBack: () => void
}) {
  const toggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter((d) => d !== domain))
    } else {
      setSelectedDomains([...selectedDomains, domain])
    }
  }

  const availableQuestions = QUESTIONS.filter((q) => {
    const domainMatch =
      selectedDomains.length === 0 || selectedDomains.includes(q.domain)
    const diffMatch = difficulty === 'all' || q.difficulty === difficulty
    return domainMatch && diffMatch
  }).length

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="text-teal text-sm mb-6 hover:text-teal-2 transition"
      >
        ← Back to Home
      </button>

      <h2 className="font-serif text-2xl text-navy mb-2">Build Your Quiz</h2>
      <p className="text-sm text-text-3 mb-8">
        Select domains and difficulty to create a custom quiz
      </p>

      {/* Domain Selection */}
      <div className="mb-8">
        <div className="text-xs tracking-widest text-text-3 mb-3">
          SELECT DOMAINS
        </div>
        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => toggleDomain(domain)}
              className={`px-3 py-2 rounded-full text-xs font-mono transition ${
                selectedDomains.includes(domain)
                  ? 'bg-teal text-white'
                  : 'bg-cream-2 text-text hover:bg-teal/20'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
        {selectedDomains.length === 0 && (
          <p className="text-xs text-text-3 mt-2">
            No domains selected = all domains included
          </p>
        )}
      </div>

      {/* Difficulty Selection */}
      <div className="mb-8">
        <div className="text-xs tracking-widest text-text-3 mb-3">
          SELECT DIFFICULTY
        </div>
        <div className="flex gap-2">
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-4 py-2 rounded-lg text-xs font-mono capitalize transition ${
                difficulty === diff
                  ? 'bg-teal text-white'
                  : 'bg-cream-2 text-text hover:bg-teal/20'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Question Count */}
      <div className="mb-8">
        <div className="text-xs tracking-widest text-text-3 mb-3">
          NUMBER OF QUESTIONS
        </div>
        <div className="flex flex-wrap gap-2">
          {[10, 25, 50, 100, 200, availableQuestions].map((count) => {
            const actualCount = Math.min(count, availableQuestions)
            const isDisabled = availableQuestions < count && count !== availableQuestions
            const label = count === availableQuestions ? `All (${availableQuestions})` : count.toString()
            return (
              <button
                key={count}
                onClick={() => setQuestionCount(actualCount)}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-lg text-xs font-mono transition ${
                  questionCount === actualCount && !isDisabled
                    ? 'bg-teal text-white'
                    : isDisabled
                    ? 'bg-cream-2 text-text-3 opacity-50 cursor-not-allowed'
                    : 'bg-cream-2 text-text hover:bg-teal/20'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg p-4 border border-cream-2 mb-8">
        <div className="text-xs tracking-widest text-text-3 mb-2">
          QUIZ PREVIEW
        </div>
        <div className="font-serif text-2xl text-navy">
          {Math.min(questionCount, availableQuestions)} Questions
        </div>
        <p className="text-sm text-text-3">
          {availableQuestions} questions available with current filters
        </p>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={availableQuestions === 0}
        className="w-full bg-teal text-white py-4 rounded-lg font-mono text-sm tracking-widest hover:bg-teal-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        START CUSTOM QUIZ
      </button>
    </div>
  )
}
