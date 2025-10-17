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


<script lang="ts">
  import { apiFetch } from '../api.ts';

  export default {
    data() {
      return {
        email: '',
        password: '',
        error: null,
      };
    },
    methods: {
      async login() {
        try {
          const res = await apiFetch('http://localhost:9090/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({
              email: this.email,
              password: this.password,
            }),
          });

          if (res.message === 'login successful') {
            this.$router.push('/dashboard');
          } else {
            this.error = 'Invalid credentials';
          }
        } catch (err) {
          this.error = err.data?.error || 'Login failed';
        }
      },
    },
  };
</script>