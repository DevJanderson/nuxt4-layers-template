import type { NavItem, NavGroup } from '../types'

export function useNavigation<T extends NavItem>(groups: NavGroup<T>[]) {
  const route = useRoute()

  const flatItems = computed(() => groups.flatMap(group => group.items))

  const currentIndex = computed(() => flatItems.value.findIndex(item => item.path === route.path))

  const prevPage = computed(() =>
    currentIndex.value > 0 ? flatItems.value[currentIndex.value - 1] : null
  )

  const nextPage = computed(() =>
    currentIndex.value < flatItems.value.length - 1 ? flatItems.value[currentIndex.value + 1] : null
  )

  return {
    navigation: groups,
    flatItems,
    currentIndex,
    prevPage,
    nextPage
  }
}
