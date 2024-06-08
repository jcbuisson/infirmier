import { computed } from 'vue'
import { useSessionStorage } from '@vueuse/core'

import { app } from '/src/client-app.js'


// state backed in SessionStorage
const initialState = () => ({
   cardCache: {},
   cardStatus: {},
   cardListStatus: {},
})

const key = 'card-state'
const cardState = useSessionStorage(key, initialState(), { mergeDefaults: true })

export const resetUseCard = () => {
   cardState.value = null
}


app.service('card').on('create', card => {
   console.log('CARD EVENT created', card)
   cardState.value.cardCache[card.id] = card
})

app.service('card').on('update', card => {
   console.log('CARD EVENT update', card)
   cardState.value.cardCache[card.id] = card
})

app.service('card').on('delete', card => {
   console.log('CARD EVENT delete', card)
   delete cardState.value.cardCache[card.id]
})


export const getCard = async (id) => {
   let card = cardState.value.cardCache[id]
   if (card) return card
   card = await app.service('card').findUnique({ where: { id }})
   cardState.value.cardCache[id] = card
   return card
}

export const cardOfId = computed(() => (id) => {
   const status = cardState.value.cardStatus[id]
   if (status === 'ready') return cardState.value.cardCache[id]
   if (status !== 'ongoing') {
      cardState.value.cardStatus[id] = 'ongoing'
      app.service('card').findUnique({ where: { id }})
      .then(card => {
         cardState.value.cardCache[id] = card
         cardState.value.cardStatus[id] = 'ready'
      })
      .catch(err => {
         console.log('cardOfId err', id, err)
         cardState.value.cardStatus[id] = undefined
      })
   }
})

export const createCard = async (topic_id, title = '', content = '') => {
   // get highest rank
   const result = await app.service('card').aggregate({
      where: { topic_id},
      _max: { rank: true }
   })
   const highestRank = result._max.rank
   const rank = highestRank ? highestRank + 1 : 1
   // create card with this rank
   const card = await app.service('card').create({
      data: {
         rank,
         topic_id,
         title,
         content,
      }
   })
   // update cache
   cardState.value.cardCache[card.id] = card
   return card
}

export const updateCard = async (id, data) => {
   const card = await app.service('card').update({
      where: { id },
      data,
   })
   // update cache
   cardState.value.cardCache[card.id] = card
   return card
}

export const removeCard = async (id) => {
   await app.service('card').delete({ where: { id }})
   delete cardState.value.cardCache[id]
}

export const getCardList = async (topic_id) => {
   if (cardState.value.cardListStatus[topic_id] !== 'ready') {
      cardState.value.cardListStatus[topic_id] = 'ongoing'
      const list = await app.service('card').findMany({
         where: { topic_id }
      })
      for (const card of list) {
         cardState.value.cardCache[card.id] = card
      }
      cardState.value.cardListStatus[topic_id] = 'ready'
   }
   return Object.values(cardState.value.cardCache).filter(card => card.topic_id === topic_id).sort((e1, e2) => e1.rank - e2.rank)
}

export const listOfCards = computed(() => (topic_id) => {
   if (cardState.value.cardListStatus[topic_id] === 'ready') {
      return Object.values(cardState.value.cardCache).filter(card => card.topic_id === topic_id).sort((e1, e2) => e1.rank - e2.rank)
   }
   if (cardState.value.cardListStatus[topic_id] !== 'ongoing') {
      cardState.value.cardListStatus[topic_id] = 'ongoing'
      app.service('card').findMany({
         where: { topic_id }
      }).then((list) => {
         for (const card of list) {
            cardState.value.cardCache[card.id] = card
         }
         cardState.value.cardListStatus[topic_id] = 'ready'
      })
   }
   return []
})
