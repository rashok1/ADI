import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import BreakdownPage from './pages/BreakdownPage'
import AddTaskPage from './pages/AddTaskPage'
import TasksListPage from './pages/TasksListPage'
import PomodoroPage from './pages/PomodoroPage'
import WeeklyRecordPage from './pages/WeeklyRecordPage'
import MoodCheckInPage from './pages/MoodCheckInPage'
import SettingsPage from './pages/SettingsPage'

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <HomePage />
          </Protected>
        }
      />
      <Route
        path="/breakdown/:taskId"
        element={
          <Protected>
            <BreakdownPage />
          </Protected>
        }
      />
      <Route
        path="/add-task"
        element={
          <Protected>
            <AddTaskPage />
          </Protected>
        }
      />
      <Route
        path="/tasks"
        element={
          <Protected>
            <TasksListPage />
          </Protected>
        }
      />
      <Route
        path="/pomodoro"
        element={
          <Protected>
            <PomodoroPage />
          </Protected>
        }
      />
      <Route
        path="/record"
        element={
          <Protected>
            <WeeklyRecordPage />
          </Protected>
        }
      />
      <Route
        path="/mood"
        element={
          <Protected>
            <MoodCheckInPage />
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected>
            <SettingsPage />
          </Protected>
        }
      />
    </Routes>
  )
}
