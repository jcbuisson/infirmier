import { useSessionStorage } from '@vueuse/core'

import { app } from '/src/client-app.js'

import { resetUseAppState } from '/src/use/useAppState'
import { resetUseUser } from '/src/use/useUser'
import { resetUseUE } from '/src/use/useUE'
import { resetUseSubUE } from '/src/use/useSubUE'
import { resetUseTopic } from '/src/use/useTopic'
import { resetUseCourse } from '/src/use/useCourse'
import { resetUseCard } from '/src/use/useCard'
import { resetUseCaseStudy } from '/src/use/useCaseStudy'
import { resetUseQuiz } from '/src/use/useQuiz'
import { resetUseQuizChoice } from '/src/use/useQuizChoice'
import { resetUseUserCourse } from '/src/use/useUserCourse'
import { resetUseUserCard } from '/src/use/useUserCard'
import { resetUseUserQuiz } from '/src/use/useUserQuiz'
import { resetUseUserQuizChoice } from '/src/use/useUserQuizChoice'
import { resetUseUserCaseStudy } from '/src/use/useUserCaseStudy'
import { resetUseHighlightedPart } from '/src/use/useHighlightedPart'

import router from '/src/router'


// state backed in SessionStorage
const initialState = () => ({
   user: null,
})

const authenticationState = useSessionStorage('authentication-state', initialState())

export const resetUseAuthentication = () => {
   authenticationState.value = initialState()
}

export function clearSessionStorage() {
   console.log('clearSessionStorage')
   resetUseAuthentication()
   resetUseAppState()
   resetUseUser()
   resetUseUE()
   resetUseSubUE()
   resetUseTopic()
   resetUseCourse()
   resetUseCard()
   resetUseCaseStudy()
   resetUseQuiz()
   resetUseQuizChoice()
   resetUseUserCourse()
   resetUseUserCard()
   resetUseUserQuiz()
   resetUseUserQuizChoice()
   resetUseUserCaseStudy()
   resetUseHighlightedPart()
}

export const restartApp = async () => {
   clearSessionStorage()
   try {
      // can fail if connection is broken
      await app.service('auth').logout()
   } catch(err) {}
   router.push('/')
}


////////////////////////           LOGIN / LOGOUT            ////////////////////////

// throws an error 'wrong-credentials' if wrong email / password
export async function localSignin(email, password) {
   const user = await app.service('auth').localSignin(email, password)
   await addUserAction(user.id, 'login')
   return user
}

export async function logout(userId) {
   try {
      await addUserAction(userId, 'logout')
   } catch(err) {
      console.log('err', err)
   }

   clearSessionStorage()

   try {
      await app.service('auth').logout()
   } catch(err) {
      console.log('err', err)
   }
   // router.push('/')
}

export async function addUserAction(user_id, action) {
   await app.service('user_action').create({ data: {
      user_id,
      action,
   }})
}
