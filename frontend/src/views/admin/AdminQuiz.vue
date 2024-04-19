<template>
   <h1 class="text-xl font-semibold">{{ quiz && quiz.title }}</h1>

   <h1 class="text-xl font-semibold">QCM</h1>

   <div class="link m-2" @click="back">back</div>
   <div class="link m-2" @click="preview">preview</div>

   <div>
      <h1 class="text-xl font-semibold">Titre</h1>
      <textarea placeholder="Titre"
         :value="quiz ? quiz.title : ''"
         @input="debouncedInputTitle" class="textarea textarea-bordered"
         :disabled="disabledTitle"
      ></textarea>
      <span class="link m-2" @click="disabledTitle = !disabledTitle">edit</span>
   </div>

   <div>
      <h1 class="text-xl font-semibold">Texte de la question</h1>
      <textarea placeholder="Question"
         :value="quiz ? quiz.question : ''"
         @input="debouncedInputQuestion" class="textarea textarea-bordered"
         :disabled="disabledQuestion"
      ></textarea>
      <span class="link m-2" @click="disabledQuestion = !disabledQuestion">edit</span>
   </div>

   <div>
      <h1 class="text-xl font-semibold">Choix possibles</h1>
      <ul v-for="choice, index in quizChoiceList">
         <ListItem
            field="text"
            :index="index" :list="quizChoiceList"
            @update="updateChoiceList"
            @remove="deleteChoice(choice.id)"
            @select="selectChoice(choice.id)"
         ></ListItem>
      </ul>
      <button class="btn btn-primary" @click="addChoice">Ajouter un choix</button>
   </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'

import { getQuiz, updateQuiz } from '/src/use/useQuiz'
import { getQuizChoiceList, createQuizChoice, removeQuizChoice } from '/src/use/useQuizChoice'
import { getAuthenticatedUser } from '/src/use/useAuthentication'
import router from '/src/router'

import ListItem from '/src/components/ListItem.vue'


const props = defineProps({
   quiz_id: {
      type: Number,
      required: true
   },
})

const quiz = ref()
const quizChoiceList = ref([])

onMounted(async () => {
   quiz.value = await getQuiz(props.quiz_id)
   quizChoiceList.value = await getQuizChoiceList(props.quiz_id)
})

const onInputTitle = async (ev) => {
   await updateQuiz(props.quiz_id, { title: ev.target.value })
}
const debouncedInputTitle = useDebounceFn(onInputTitle, 500)

const disabledTitle = ref(true)

const onInputQuestion = async (ev) => {
   await updateQuiz(props.quiz_id, { question: ev.target.value })
}
const debouncedInputQuestion = useDebounceFn(onInputQuestion, 500)

const disabledQuestion = ref(true)

async function updateChoiceList() {
   const unorderedList = await getQuizChoiceList(props.quiz_id)
   quizChoiceList.value = unorderedList.sort((e1, e2) => e1.rank - e2.rank)
}

const selectChoice = (id) => {
   router.push(`/home/${getAuthenticatedUser().id}/admin-quiz-choice/${id}`)
}

const addChoice = async () => {
   const choice = await createQuizChoice(props.quiz_id)
   await updateChoiceList()
   selectChoice(choice.id)
}

const deleteChoice = async (id) => {
   await removeQuizChoice(id)
   await updateChoiceList()
}

const back = () => {
   router.back()
}

const preview = () => {
   console.log('preview')
}
</script>