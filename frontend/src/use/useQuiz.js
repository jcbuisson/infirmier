import { useSessionStorage } from '@vueuse/core'

import app from '/src/client-app.js'


// state backed in SessionStorage
const initialState = () => ({
   quizCache: {},
   isListReady: {},
})
 
const quizState = useSessionStorage('quiz-state', initialState())

export const resetUseQuiz = () => {
   quizState.value = initialState()
}


app.service('quiz').on('create', quiz => {
   console.log('QUIZ EVENT created', quiz)
   quizState.value.quizCache[quiz.id] = quiz
})


export const getQuiz = async (id) => {
   const quiz = quizState.value.quizCache[id]
   if (quiz) return quiz
   const promise = app.service('quiz').findUnique({ where: { id }})
   promise.then(quiz => {
      quizState.value.quizCache[id] = quiz
   })
   return promise
}

export const createQuiz = async (topic_id) => {
   // get highest rank
   const result = await app.service('quiz').aggregate({
      where: { topic_id},
      _max: { rank: true }
   })
   const highestRank = result._max.rank
   const rank = highestRank ? highestRank + 1 : 1
   // create quiz with this rank
   const quiz = await app.service('quiz').create({
      data: {
         rank,
         topic_id,
         title: '',
         question: '',
      }
   })
   // update cache
   quizState.value.quizCache[quiz.id] = quiz
   return quiz
}

export const updateQuiz = async (id, data) => {
   const quiz = await app.service('quiz').update({
      where: { id },
      data,
   })
   // update cache
   quizState.value.quizCache[quiz.id] = quiz
   return quiz
}

export const removeQuiz = async (id) => {
   await app.service('quiz').delete({ where: { id }})
   delete quizState.value.quizCache[id]
}

export const getQuizList = async (topic_id) => {
   if (!quizState.value.isListReady[topic_id]) {
      const list = await app.service('quiz').findMany({
         where: { topic_id }
      })
      for (const quiz of list) {
         quizState.value.quizCache[quiz.id] = quiz
      }
      quizState.value.isListReady[topic_id] = true
   }
   return Object.values(quizState.value.quizCache).filter(quiz => quiz.topic_id === topic_id)
}