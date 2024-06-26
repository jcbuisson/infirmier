<template>
   <div class="py-4 flex flex-col h-screen">

      <!-- navbar -->
      <nav class="lg:border-b lg:pb-2">

         <main class="flex w-full justify-between items-center container max-w-7xl">
            <button @click="toggleSideMenu">
               <img class="w-6" src="/src/assets/menu.svg" alt="menu">
            </button>

            <router-link class="flex items-center gap-4 lg:flex-1 lg:px-12" :to="`/home/${userid}/study-ue`">
               <img class="h-12" src="/src/assets/logo.svg" alt="Logo">
               <h3 class="max-lg:hidden">Journal de bord IDE</h3>
            </router-link>

            <div class="cursor-pointer link hover:text-red-600 text-blue-600" @click="signout">
               Sortie
            </div>

         </main>

         <!-- side menu -->
         <aside ref="sidebarMenu"
            class="hidden fixed bg-black/70 h-screen w-screen top-0 left-0 transition-all z-50">

            <main ref="sidebarMenuArea"
                  class="fixed h-screen top-0 -left-full w-1/5 max-lg:w-1/3 max-sm:w-2/3 bg-white p-5 flex flex-col transition-all">

               <div class="w-full flex justify-end">
                  <button @click="toggleSideMenu()">
                     <img src="/src/assets/cancel.svg" alt="cancel">
                  </button>
               </div>

               <div class="flex justify-center">
                  <img class="w-36" src="/src/assets/logo.svg" alt="logo">
               </div>

               <div class="py-8 mx-4 flex-1 flex flex-col gap-2">

                  <template v-for="item, index in menuItems">
                     <div @click="selectItem(index)" class="cursor-pointer flex gap-4 items-center w-full p-3 rounded-lg"
                           :class="{'bg-primary': isCurrentItem(item), 'opacity-50': !isCurrentItem(item)}">
                        <svg class="w-5 h-5" :stroke="isCurrentItem(item) ? 'white' : 'black'">
                           <path fill="white" :d="item.iconPath"></path>
                        </svg>

                        <p class="font-medium" :class="{ 'text-white': isCurrentItem(item)}">
                           {{ item.label }}
                        </p>
                     </div>
                  </template>
               </div>


               <div class="mx-4 ">
                  <p class="p-3 opacity-50">Version {{ VERSION }}</p>
                  <button class="flex gap-4 items-center w-full p-3 rounded-lg opacity-50" @click="signout">
                     <img class="w-5" src="/src/assets/logout.svg" alt="logout">
                     <p class="font-medium">
                        Déconnexion
                     </p>
                  </button>
               </div>

            </main>

            <div id="sidebarMenuSpace" @click="toggleSideMenu"
               class="fixed h-screen top-0 right-0 w-4/5 max-lg:w-2/3 max-sm:w-1/3">
            </div>

         </aside>
      </nav>

      <router-view></router-view>

   </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'

import { logout, clearSessionStorage } from '/src/use/useAuthentication'
import { userOfId, getUser } from '/src/use/useUser'
import { isCareTabVisible } from '/src/use/useCare'
import { isDocumentTabVisible } from '/src/use/useDocument'
import { isLegislationTabVisible } from '/src/use/useLegislation'

import { courseIconPath, revisionIconPath } from '/src/lib/icons.mjs'
import router from '/src/router'
import { VERSION } from '/src/version'


const props = defineProps({
   userid: {
      type: Number,
      required: true
   },
})

const user = computed(() => userOfId.value(props.userid))

const menuItems = computed(() => {
   const items = []

   if (user.value?.admin) {
      items.push({
         label: "Contenu",
         path: `/home/${props.userid}/admin-ue`,
         iconPath: courseIconPath,
      })
      items.push({
         label: "Soins",
         path: `/home/${props.userid}/admin-care`,
         iconPath: revisionIconPath,
      })
      items.push({
         label: "Documents",
         path: `/home/${props.userid}/admin-document`,
         iconPath: revisionIconPath,
      })
      items.push({
         label: "Législation",
         path: `/home/${props.userid}/admin-legislation`,
         iconPath: revisionIconPath,
      })
      items.push({
         label: "Lexique",
         path: `/home/${props.userid}/admin-lexicon`,
         iconPath: revisionIconPath,
      })
      items.push({
         label: "Divers",
         path: `/home/${props.userid}/admin-misc`,
         iconPath: revisionIconPath,
      })

   } else {
      items.push({
         label: "Cours",
         path: `/home/${props.userid}/study-ue`,
         iconPath: courseIconPath,
      })
      items.push({
         label: "Révisions",
         path: `/home/${props.userid}/revise-ue`,
         iconPath: revisionIconPath,
      })
      if (isCareTabVisible.value) items.push({
         label: "Soins",
         path: `/home/${props.userid}/care`,
         iconPath: revisionIconPath,
      })
      if (isDocumentTabVisible.value) items.push({
         label: "Documents",
         path: `/home/${props.userid}/document`,
         iconPath: revisionIconPath,
      })
      if (isLegislationTabVisible.value) items.push({
         label: "Législation",
         path: `/home/${props.userid}/legislation`,
         iconPath: revisionIconPath,
      })

      items.push({
         label: "Lexique",
         path: `/home/${props.userid}/lexicon`,
         iconPath: revisionIconPath,
      })
   }
   return items
})


onMounted(async () => {
   const user_ = await getUser(props.userid)
   if (user_.admin) {
      // go to UE admin page
      router.push(`/home/${props.userid}/admin-ue`)
   } else {
      // prevent copy for student
      // document.addEventListener('copy', (event) => {
      //    event.preventDefault()
      // })
      // go to student welcome page
      router.push(`/home/${props.userid}/welcome-student`)
   }
})

const selectItem = (index) => {
   currentItemIndex.value = index
   toggleSideMenu()
   const item = menuItems.value[index]
   router.push(item.path)
}

const currentItemIndex = ref(0)
const isCurrentItem = computed(() => (item) => {
   return item === menuItems.value[currentItemIndex.value]
})

const sidebarMenu = ref(null)
const sidebarMenuArea = ref(null)

let sidebarMenuOpen = false

function toggleSideMenu() {
   if (sidebarMenuOpen) {
      sidebarMenuArea.value.style.left = '-100%'
      setTimeout(() => {
         sidebarMenu.value.style.display = 'none'
      }, 100)
      sidebarMenuOpen = false
   } else {
      sidebarMenu.value.style.display = 'flex'
      setTimeout(() => {
         sidebarMenuArea.value.style.left = 0
      }, 100)
      sidebarMenuOpen = true
   }
}

const signout = async () => {
   // change to a page (front page) which calls no service
   await router.push(`/`)
   console.log('on front page')
   // ...then unauthenticate
   // await logout(props.userid)
   clearSessionStorage()
}
</script>
