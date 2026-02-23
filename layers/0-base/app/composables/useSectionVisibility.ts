export function useSectionVisibility(options?: { threshold?: number }) {
  const sectionRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)

  onMounted(() => {
    if (!sectionRef.value) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) isVisible.value = true
      },
      { threshold: options?.threshold ?? 0.1 },
    )
    observer.observe(sectionRef.value)
    onUnmounted(() => observer.disconnect())
  })

  return { sectionRef, isVisible }
}
