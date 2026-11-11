import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '../shared/layout/AppLayout'
import { AnalyticsPage } from '../features/analytics/pages/AnalyticsPage'
import { CalendarPage } from '../features/calendar/pages/CalendarPage'
import { DayPage } from '../features/day/pages/DayPage'
import { HomePage } from '../features/home/pages/HomePage'
import { ShowcasePage } from '../features/showcase/pages/ShowcasePage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: 'home', element: <HomePage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'calendar/:date', element: <DayPage /> },
      { path: 'showcase', element: <ShowcasePage /> },
      { path: '*', element: <Navigate to="/home" replace /> },
    ],
  },
])
