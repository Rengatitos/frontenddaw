<template>
  <div class="error-unauthorized">
    <h1>Unauthorized Access</h1>
    <p>You do not have permission to view this page.</p>
  </div>
</template>

<script>
export default {
  name: 'ErrorUnauthorized',
}
</script>

<style scoped>
.error-unauthorized {
  text-align: center;
  margin-top: 50px;
}

h1 {
  color: red;
}
</style>
