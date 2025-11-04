<template>
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
        <div class="modal-content">
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-description">{{ description }}</p>

            <form @submit.prevent="handleSubmit" class="modal-form">
                <div class="form-field">
                    <label for="password-input" class="form-label">
                        {{ t('password') }}
                    </label>
                    <input id="password-input" v-model="password" type="password" class="form-input"
                        :placeholder="t('enter_password_to_confirm')" required autofocus />
                </div>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <div class="modal-actions">
                    <button type="button" @click="$emit('cancel')" class="uranus-secondary-button">
                        {{ t('form_cancel') }}
                    </button>
                    <button type="submit" :disabled="isSubmitting" class="uranus-button uranus-button--danger">
                        {{ isSubmitting ? loadingText : confirmText }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
    show: boolean
    title: string
    description: string
    confirmText: string
    loadingText: string
    error?: string
    isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    error: '',
    isSubmitting: false,
})

const emit = defineEmits<{
    confirm: [password: string]
    cancel: []
}>()

const password = ref('')

// Reset password when modal is closed
watch(() => props.show, (newValue) => {
    if (!newValue) {
        password.value = ''
    }
})

const handleSubmit = () => {
    emit('confirm', password.value)
}
</script>

<style scoped lang="scss">
// Modal styles
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
}

.modal-content {
    background: var(--surface-primary, #ffffff);
    border-radius: 0.5rem;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 10000;
}

.modal-title {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
}

.modal-description {
    margin: 0 0 1.5rem;
    color: var(--color-text);
    line-height: 1.5;
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-text);
}

.form-input {
    padding: 0.75rem;
    border: 2px solid var(--border-soft);
    border-radius: 0.375rem;
    font-size: 1rem;
    background: var(--surface-primary, #ffffff);
    color: var(--color-text, #000000);
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: var(--accent-primary);
    }
}

.error-message {
    padding: 0.75rem;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 0.375rem;
    font-size: 0.9rem;
}

.modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
}

.uranus-button--danger {
    background: #dc2626;
    color: white;
    border-color: #dc2626;

    &:hover:not(:disabled) {
        background: #b91c1c;
        border-color: #b91c1c;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}
</style>
