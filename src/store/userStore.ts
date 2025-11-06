import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    // State as refs
    const displayName = ref('')
    const userId = ref('')
    const avatarVersion = ref(0)

    // Actions as functions
    function setUserId(id: string) {
        userId.value = id
    }

    function clearUserId() {
        userId.value = ''
        avatarVersion.value = 0
    }

    function setDisplayName(name: string) {
        displayName.value = name
    }

    function clearDisplayName() {
        displayName.value = ''
    }

    function bumpAvatarVersion() {
        avatarVersion.value = Date.now()
    }

    return {
        displayName,
        userId,
        avatarVersion,
        setUserId,
        clearUserId,
        setDisplayName,
        clearDisplayName,
        bumpAvatarVersion
    }
}, {
    persist: true
})
