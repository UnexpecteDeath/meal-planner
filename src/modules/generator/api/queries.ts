import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { generateDayPlan, getRemainingGenerations } from './index'

export function useGenerationLimitQuery(generationDate: Ref<string>) {
  return useQuery({
    queryKey: ['meal-generation-limit', generationDate],
    queryFn: () => getRemainingGenerations(generationDate.value),
    gcTime: 0,
    retry: false,
  })
}

export function useGenerateDayPlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: generateDayPlan,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['meal-history'],
      })
    },

    onSettled: () => {
      return queryClient.invalidateQueries({ queryKey: ['meal-generation-limit'] })
    },
  })
}
