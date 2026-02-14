import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    player: {
      id: null,
      name: '',
      level: 1,
      experience: 0,
      health: 100,
      mana: 50,
      strength: 10,
      agility: 10,
      intelligence: 10,
      inventory: []
    },
    currentScene: 'home',
    gameStarted: false,
    gameState: 'idle' // idle, playing, paused, gameOver
  }),
  getters: {
    isGameStarted: (state) => state.gameStarted,
    currentPlayer: (state) => state.player,
    currentLocation: (state) => state.currentScene
  },
  actions: {
    startGame(playerName) {
      this.gameStarted = true
      this.gameState = 'playing'
      this.player = {
        id: 1,
        name: playerName || 'Adventurer',
        level: 1,
        experience: 0,
        health: 100,
        mana: 50,
        strength: 10,
        agility: 10,
        intelligence: 10,
        inventory: []
      }
      this.currentScene = 'village'
    },
    pauseGame() {
      this.gameState = 'paused'
    },
    resumeGame() {
      this.gameState = 'playing'
    },
    endGame() {
      this.gameState = 'gameOver'
    },
    changeScene(sceneName) {
      this.currentScene = sceneName
    },
    addExperience(amount) {
      this.player.experience += amount
      // 简单的升级逻辑
      if (this.player.experience >= this.player.level * 100) {
        this.player.level += 1
        this.player.experience -= this.player.level * 100
        this.player.health += 10
        this.player.mana += 5
        this.player.strength += 2
        this.player.agility += 2
        this.player.intelligence += 2
      }
    },
    takeDamage(amount) {
      this.player.health -= amount
      if (this.player.health <= 0) {
        this.player.health = 0
        this.endGame()
      }
    },
    heal(amount) {
      this.player.health = Math.min(this.player.health + amount, 100)
    },
    addItem(item) {
      this.player.inventory.push(item)
    },
    removeItem(itemId) {
      this.player.inventory = this.player.inventory.filter(item => item.id !== itemId)
    }
  }
})