import { useMutation, useQueryClient } from 'react-query'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { CreateChore, GetChoresHistory, GetChoresNew } from '../utils/Fetcher'

export const useChores = includeArchive => {
  return useQuery(['chores', includeArchive], () =>
    GetChoresNew(includeArchive),
  )
}

export const useCreateChore = () => {
  const queryClient = useQueryClient()

  return useMutation(CreateChore, {
    onSuccess: () => {
      queryClient.invalidateQueries('chores')
    },
  })
}

export const useChoresHistory = (initialLimit, includeMembers) => {
  const [limit, setLimit] = useState(initialLimit)

  const { data, error, isLoading } = useQuery(['choresHistory', limit], () =>
    GetChoresHistory(limit, includeMembers),
  )

  return { data, error, isLoading, setLimit }
}
