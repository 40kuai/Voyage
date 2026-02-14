<template>
  <div class="home">
    <h1>Voyage - 冒险游戏</h1>
    <p>欢迎来到Voyage冒险游戏！</p>
    <button @click="startGame">开始游戏</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useGameStore } from '../store/game'

const router = useRouter()
const gameStore = useGameStore()

const startGame = () => {
  gameStore.startGame()
  router.push('/scene')
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #333;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
}

button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}
</style>