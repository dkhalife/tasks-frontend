import { useQuery } from 'react-query'
import { GetChoresNew } from '../utils/Fetcher'

export const useChores = includeArchive => {
  return useQuery(['chores', includeArchive], () =>
    GetChoresNew(includeArchive),
  )
}

