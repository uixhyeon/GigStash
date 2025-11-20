import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    updateTheme()
    savePreference()
  }

  const setDarkMode = (value) => {
    isDark.value = value
    updateTheme()
    savePreference()
  }

  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }

  const savePreference = () => {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  const loadPreference = () => {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    updateTheme()
  }

  const initDarkMode = () => {
    loadPreference()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        isDark.value = e.matches
        updateTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
    initDarkMode
  }
}
