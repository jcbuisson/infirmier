import { useSessionStorage } from '@vueuse/core'

import app from '/src/client-app.js'


// state backed in SessionStorage
const initialState = () => ({
   userCaseStudyCache: {},
   theUserCaseStudyReady: {},
})
 
const userCaseStudyState = useSessionStorage('user-case-study-state', initialState())

export const resetUseUserCaseStudy = () => {
   userCaseStudyState.value = initialState()
}


app.service('user_case_study').on('create', (userCaseStudy) => {
   console.log('USER_CASE_STUDY EVENT created', userCaseStudy)
   userCaseStudyState.value.userCaseStudyCache[userCaseStudy.id] = userCaseStudy
})

// get or create the unique user_case_study associated to (user_id, case_study_id)
export const getTheUserCaseStudy = async (user_id, case_study_id) => {
   const isReady = userCaseStudyState.value.theUserCaseStudyReady[user_id + ':' + case_study_id]
   if (isReady) return Object.values(userCaseStudyState.value.userCaseStudyCache).find(userCaseStudy => userCaseStudy.user_id === user_id && userCaseStudy.case_study_id === case_study_id)
   let [userCaseStudy] = await app.service('user_case_study').findMany({
      where: { user_id, case_study_id },
   })
   if (!userCaseStudy) {
      userCaseStudy = await app.service('user_case_study').create({
         data: { user_id, case_study_id },
      })
   }
   userCaseStudyState.value.userCaseStudyCache[userCaseStudy.id] = userCaseStudy
   userCaseStudyState.value.theUserCaseStudyReady[user_id + ':' + case_study_id] = true
   return userCaseStudy
}

export const updateUserCaseStudy = async (id, data) => {
   const userCaseStudy = await app.service('user_case_study').update({
      where: { id },
      data,
   })
   // update cache
   userCaseStudyState.value.userCaseStudyCache[userCaseStudy.id] = userCaseStudy
   return userCaseStudy
}
