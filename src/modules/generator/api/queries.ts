import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { generateDayPlan } from './index'


export function useGenerateDayPlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: generateDayPlan,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['meal-history'],
      })
    },
  })
}
