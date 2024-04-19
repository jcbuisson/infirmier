import { useSessionStorage } from '@vueuse/core'

import app from '/src/client-app.js'


// state backed in SessionStorage
const initialState = () => ({
   quizChoiceCache: {},
   isListReady: {},
})
 
const quizChoiceState = useSessionStorage('quiz-choice-state', initialState())

export const resetUseQuizChoice = () => {
   quizChoiceState.value = initialState()
}


app.service('quiz_choice').on('create', (quizChoice) => {
   console.log('QUIZ_CHOICE EVENT created', quizChoice)
   quizChoiceState.value.quizChoiceCache[quizChoice.id] = quizChoice
})


export const getQuizChoice = async (id) => {
   const quizChoice = quizChoiceState.value.quizChoiceCache[id]
   if (quizChoice) return quizChoice
   const promise = app.service('quiz_choice').findUnique({ where: { id }})
   promise.then(quizChoice => {
      quizChoiceState.value.quizChoiceCache[id] = quizChoice
   })
   return promise
}

export const createQuizChoice = async (quiz_id) => {
   // get highest rank
   const result = await app.service('quiz_choice').aggregate({
      where: { quiz_id},
      _max: { rank: true }
   })
   const highestRank = result._max.rank
   const rank = highestRank ? highestRank + 1 : 1
   // create quizChoice with this rank
   const quizChoice = await app.service('quiz_choice').create({
      data: {
         rank,
         quiz_id,
         text: '',
         answer: false,
         comment: '',
      }
   })
   // update cache
   quizChoiceState.value.quizChoiceCache[quizChoice.id] = quizChoice
   return quizChoice
}

export const updateQuizChoice = async (id, data) => {
   const quizChoice = await app.service('quiz_choice').update({
      where: { id },
      data,
   })
   // update cache
   quizChoiceState.value.quizChoiceCache[quizChoice.id] = quizChoice
   return quizChoice
}

export const removeQuizChoice = async (id) => {
   await app.service('quiz_choice').delete({ where: { id }})
   delete quizChoiceState.value.quizChoiceCache[id]
}

export const getQuizChoiceList = async (quiz_id) => {
   if (!quizChoiceState.value.isListReady[quiz_id]) {
      const list = await app.service('quiz_choice').findMany({
         where: { quiz_id }
      })
      for (const quizChoice of list) {
         quizChoiceState.value.quizChoiceCache[quizChoice.id] = quizChoice
      }
      quizChoiceState.value.isListReady[quiz_id] = true
   }
   return Object.values(quizChoiceState.value.quizChoiceCache).filter(quizChoice => quizChoice.quiz_id === quiz_id)
}