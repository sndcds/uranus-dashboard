import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    // State as refs
    const emailAddress = ref('')
    const displayName = ref('')
    const userId = ref('')
    const avatarVersion = ref(0)
    const userAvatar = ref<string | null>(null)

    // Actions as functions
    function setUserId(id: string) {
        userId.value = id
    }

    function setUserAvatar(url: string | null) {
        userAvatar.value = url
    }

    function clearUserId() {
        userId.value = ''
        avatarVersion.value = 0
    }

    function setEmailAddress(email: string) {
        emailAddress.value = email
    }

    function clearEmailAddress() {
        emailAddress.value = ''
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
        emailAddress,
        displayName,
        userId,
        avatarVersion,
        userAvatar,
        setUserAvatar,
        setUserId,
        clearUserId,
        setDisplayName,
        clearDisplayName,
        setEmailAddress,
        clearEmailAddress,
        bumpAvatarVersion
    }
}, {
    persist: true
})
