<template>
  <div class="inventory">
    <div class="inventory-header">
      <h2>背包</h2>
      <button @click="closeInventory" class="close-button">×</button>
    </div>
    
    <div class="inventory-content">
      <div v-if="inventory.length === 0" class="empty-inventory">
        背包是空的
      </div>
      
      <div v-else class="item-grid">
        <div v-for="item in inventory" :key="item.id" class="item-card" :style="getRarityStyle(item.rarity)">
          <div class="item-icon">{{ getItemIcon(item.type) }}</div>
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <div class="item-meta">
              <span class="item-value">价值: {{ item.value }} 金币</span>
              <span class="item-type">{{ getItemTypeName(item.type) }}</span>
              <span class="item-rarity">{{ getItemRarityName(item.rarity) }}</span>
            </div>
            <button v-if="canUseItem(item)" @click="useItem(item)" class="use-button">使用</button>
            <button v-else @click="dropItem(item.id)" class="drop-button">丢弃</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../store/game'
import {
  getItemIcon,
  getItemTypeName,
  getItemRarityName,
  getItemRarityColor,
  canUseItem,
  useItemEffect,
  compareItems
} from '../utils/itemUtils'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const gameStore = useGameStore()
const inventory = computed(() => {
  // 对物品进行排序
  return [...gameStore.player.inventory].sort(compareItems)
})

const closeInventory = () => {
  emit('close')
}

const useItem = (item) => {
  const result = useItemEffect(item, gameStore.player)
  if (result.used) {
    gameStore.removeItem(item.id)
    console.log(result.message)
  }
}

const dropItem = (itemId) => {
  gameStore.removeItem(itemId)
  console.log('丢弃了物品')
}

const getRarityStyle = (rarity) => {
  return {
    borderColor: getItemRarityColor(rarity),
    boxShadow: `0 0 10px ${getItemRarityColor(rarity)}40`
  }
}
</script>

<style scoped>
.inventory {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background-color: #343a40;
  color: white;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.inventory-header {
  padding: 20px;
  border-bottom: 1px solid #495057;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inventory-header h2 {
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

.inventory-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.empty-inventory {
  text-align: center;
  padding: 40px;
  color: #adb5bd;
  font-size: 1.2rem;
}

.item-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.item-card {
  background-color: #495057;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  gap: 15px;
  transition: transform 0.2s, border-color 0.3s, box-shadow 0.3s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.item-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.item-info p {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #adb5bd;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
  font-size: 0.8rem;
  color: #ced4da;
}

.item-rarity {
  font-weight: bold;
}

.use-button,
.drop-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.use-button {
  background-color: #28a745;
  color: white;
}

.use-button:hover {
  background-color: #218838;
}

.drop-button {
  background-color: #dc3545;
  color: white;
}

.drop-button:hover {
  background-color: #c82333;
}
</style>