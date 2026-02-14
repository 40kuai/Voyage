<template>
  <div class="map">
    <div class="map-header">
      <h2>地图</h2>
      <button @click="closeMap" class="close-button">×</button>
    </div>
    
    <div class="map-content">
      <div class="map-grid">
        <div 
          v-for="(scene, key) in scenes" 
          :key="key"
          class="map-node"
          :class="{ 'current': key === currentScene, 'visited': visitedScenes.includes(key) }"
          @click="goToScene(key)"
        >
          <div class="node-icon">{{ getSceneIcon(key) }}</div>
          <div class="node-name">{{ scene.name }}</div>
          <div class="node-exits">
            <span v-for="(exit, direction) in scene.exits" :key="direction" class="exit-arrow">
              {{ getDirectionArrow(direction) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '../store/game'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'scene-change'])

const gameStore = useGameStore()
const currentScene = computed(() => gameStore.currentScene)
const visitedScenes = ref(['village']) // 初始只访问了村庄

const closeMap = () => {
  emit('close')
}

const goToScene = (sceneName) => {
  // 检查是否可以直接前往该场景（是否已访问过）
  if (visitedScenes.value.includes(sceneName)) {
    emit('scene-change', sceneName)
    emit('close')
  }
}

const scenes = {
  village: {
    name: '宁静村庄',
    exits: {
      '北': 'forest',
      '东': 'farm',
      '南': 'river',
      '西': 'mountain'
    }
  },
  forest: {
    name: '神秘森林',
    exits: {
      '南': 'village',
      '东': 'clearing'
    }
  },
  farm: {
    name: '丰收农场',
    exits: {
      '西': 'village'
    }
  },
  river: {
    name: '清澈河流',
    exits: {
      '北': 'village'
    }
  },
  mountain: {
    name: '雄伟山脉',
    exits: {
      '东': 'village',
      '北': 'cave'
    }
  },
  clearing: {
    name: '森林空地',
    exits: {
      '西': 'forest'
    }
  },
  cave: {
    name: '黑暗洞穴',
    exits: {
      '南': 'mountain'
    }
  }
}

const getSceneIcon = (scene) => {
  const icons = {
    village: '🏠',
    forest: '🌲',
    farm: '🌾',
    river: '🌊',
    mountain: '⛰️',
    clearing: '🌳',
    cave: '🕳️'
  }
  return icons[scene] || '📍'
}

const getDirectionArrow = (direction) => {
  const arrows = {
    '北': '↑',
    '东': '→',
    '南': '↓',
    '西': '←'
  }
  return arrows[direction] || ''
}
</script>

<style scoped>
.map {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100vh;
  background-color: #343a40;
  color: white;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.map-header {
  padding: 20px;
  border-bottom: 1px solid #495057;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #adb5bd;
}

.map-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.map-node {
  background-color: #495057;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.map-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.map-node.current {
  background-color: #007bff;
  border: 2px solid #ffffff;
}

.map-node.visited {
  background-color: #28a745;
}

.map-node:not(.visited) {
  background-color: #6c757d;
  cursor: not-allowed;
}

.node-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.node-name {
  font-size: 0.9rem;
  margin-bottom: 10px;
  font-weight: bold;
}

.node-exits {
  display: flex;
  justify-content: center;
  gap: 10px;
  font-size: 1rem;
}

.exit-arrow {
  display: inline-block;
  width: 20px;
  text-align: center;
}
</style>