import { useEffect, useMemo, useState } from 'react'

const BREAKPOINTS = {
   mobile: 768,
   tablet: 1024,
} as const

export const useIsMobile = () => {
   const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINTS.mobile)

   useEffect(() => {
      const handleResize = () => {
         setIsMobile(window.innerWidth < BREAKPOINTS.mobile)
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
   }, [])

   return isMobile
}

export const useBreakpoint = () => {
   const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.mobile) return 'mobile'
      if (width < BREAKPOINTS.tablet) return 'tablet'
      return 'desktop'
   })

   useEffect(() => {
      const handleResize = () => {
         const width = window.innerWidth
         if (width < BREAKPOINTS.mobile) {
            setBreakpoint('mobile')
         } else if (width < BREAKPOINTS.tablet) {
            setBreakpoint('tablet')
         } else {
            setBreakpoint('desktop')
         }
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
   }, [])

   return {
      breakpoint,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
   }
}

export const useIsTouchDevice = () => {
   return useMemo(() => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0
   }, [])
}
