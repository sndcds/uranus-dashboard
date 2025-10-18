<template>
  <div class="login">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiFetch } from '../api';
import type { LoginResponse } from '../api';
import { useTokenStore } from '../store/token';

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);

const router = useRouter();
const tokenStore = useTokenStore();

async function login() {
  console.log("login()");

  try {
    const res = await apiFetch<LoginResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    console.log(res.message);

    if (
      res.message === 'login successful' &&
      res.access_token &&
      res.refresh_token
    ) {
      tokenStore.setTokens(res.access_token, res.refresh_token);
      router.push('/');
    } else {
      error.value = 'Invalid credentials';
    }
  } catch (err: any) {
    error.value = err?.data?.error || 'Login failed';
  }
}
</script>
