import {trpc} from '@mintter/desktop/src/trpc'
import {toast} from '@mintter/ui'
import {useQueryInvalidator} from '../app-context'

export function useAutoUpdatePreference() {
  const invalidate = useQueryInvalidator()
  const value = trpc.appSettings.getAutoUpdatePreference.useQuery()
  const setVal = trpc.appSettings.setAutoUpdatePreference.useMutation({
    onError() {
      toast.error('Could not save this change :(')
    },
    onSuccess() {
      invalidate(['trpc.appSettings.getAutoUpdatePreference'])
    },
  })

  return {
    value,
    setAutoUpdate: setVal.mutate,
  }
}
