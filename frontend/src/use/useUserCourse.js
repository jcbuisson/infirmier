import { computed } from 'vue'
import { useSessionStorage } from '@vueuse/core'

import { app } from '/src/client-app.js'


// state backed in SessionStorage
const initialState = () => ({
   theUserCourseCache: {},
   theUserCourseStatus: {},
})

const userCourseState = useSessionStorage('user-course-state', initialState(), { mergeDefaults: true })

export const resetUseUserCourse = () => {
   userCourseState.value = null
}

app.service('user_course').on('create', (userCourse) => {
   console.log('USER_COURSE EVENT created', userCourse)
   const key = userCourse.user_id + ':' + userCourse.course_id
   userCourseState.value.theUserCourseCache[key] = userCourse
   userCourseState.value.theUserCourseStatus[key] = 'ready'
})

app.service('user_course').on('update', (userCourse) => {
   console.log('USER_COURSE EVENT update', userCourse)
   const key = userCourse.user_id + ':' + userCourse.course_id
   userCourseState.value.theUserCourseCache[key] = userCourse
   userCourseState.value.theUserCourseStatus[key] = 'ready'
})

app.service('user_course').on('delete', (userCourse) => {
   console.log('USER_COURSE EVENT delete', userCourse)
   const key = userCourse.user_id + ':' + userCourse.course_id
   delete userCourseState.value.theUserCourseCache[key]
   delete userCourseState.value.theUserCourseStatus[key]
})

// // get or create the unique user_course associated to (user_id, course_id)
// export const getTheUserCourse = async (user_id, course_id) => {
//    const key = user_id + ':' + course_id
//    if (userCourseState.value.theUserCourseStatus[key] === 'ready') return userCourseState.value.theUserCourseCache[key]
//    userCourseState.value.theUserCourseStatus[key] = 'ongoing'
//    let [userCourse] = await app.service('user_course').findMany({
//       where: { user_id, course_id },
//    })
//    if (!userCourse) {
//       userCourse = await app.service('user_course').create({
//          data: { user_id, course_id },
//       })
//    }
//    userCourseState.value.theUserCourseCache[userCourse.id] = userCourse
//    userCourseState.value.theUserCourseStatus[key] = 'ready'
//    return userCourse
// }

export const theUserCourse = computed(() => (user_id, course_id) => {
   const key = user_id + ':' + course_id
   const status = userCourseState.value.theUserCourseStatus[key]
   if (status === 'ready') return userCourseState.value.theUserCourseCache[key]
   if (status === 'ongoing') return undefined // ongoing request
   userCourseState.value.theUserCourseStatus[key] = 'ongoing'
   app.service('user_course').findMany({
      where: { user_id, course_id },
   }).then((userCourses) => {
      if (userCourses.length > 0) {
         const userCourse = userCourses[0]
         userCourseState.value.theUserCourseCache[key] = userCourse
         userCourseState.value.theUserCourseStatus[key] = 'ready'
      } else {
         app.service('user_course').create({
            data: { user_id, course_id },
         }).then(userCourse => {
            userCourseState.value.theUserCourseCache[key] = userCourse
            userCourseState.value.theUserCourseStatus[key] = 'ready'
         })
      }
   })
})

export const updateUserCourse = async (id, data) => {
   const userCourse = await app.service('user_course').update({
      where: { id },
      data,
   })
   // update cache
   const key = userCourse.user_id + ':' + userCourse.course_id
   userCourseState.value.theUserCourseCache[key] = userCourse
   return userCourse
}

// used in WelcomeStudent/preload
export const getUserCourseList = async (user_id) => {
   const userCourseList = await app.service('user_course').findMany({
      where: { user_id }
   })
   for (const userCourse of userCourseList) {
      const key = user_id + ':' + userCourse.course_id
      userCourseState.value.theUserCourseCache[key] = userCourse
      userCourseState.value.theUserCourseStatus[key] = 'ready'
   }
}
