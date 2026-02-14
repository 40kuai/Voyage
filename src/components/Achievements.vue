<template>
  <div class="achievements">
    <div class="achievements-header">
      <h2>成就</h2>
      <button @click="closeAchievements" class="close-button">×</button>
    </div>
    
    <div class="achievements-content">
      <div class="achievements-stats">
        <div class="stat-item">
          <span class="stat-label">总成就:</span>
          <span class="stat-value">{{ achievements.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已解锁:</span>
          <span class="stat-value">{{ unlockedAchievements.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">解锁率:</span>
          <span class="stat-value">{{ Math.round((unlockedAchievements.length / achievements.length) * 100) }}%</span>
        </div>
      </div>
      
      <div class="achievements-list">
        <div v-for="achievement in sortedAchievements" :key="achievement.id" class="achievement-card" :class="{ unlocked: achievement.unlocked }">
          <div class="achievement-icon">
            {{ achievement.icon || '🏆' }}
          </div>
          <div class="achievement-info">
            <h3>{{ achievement.name }}</h3>
            <div class="achievement-meta">
              <span class="achievement-rarity" :style="{ color: getAchievementRarityColor(achievement.rarity) }">
                {{ getAchievementRarityName(achievement.rarity) }}
              </span>
              <span class="achievement-date" v-if="achievement.unlockedDate">
                {{ formatDate(achievement.unlockedDate) }}
              </span>
            </div>
            <p class="achievement-description">{{ achievement.description }}</p>
            <div v-if="!achievement.unlocked" class="achievement-requirement">
              <span>需求: {{ achievement.requirement.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  getAchievementRarityName,
  getAchievementRarityColor,
  sortAchievements
} from '../utils/questUtils'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  achievements: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const sortedAchievements = computed(() => sortAchievements(props.achievements))

const unlockedAchievements = computed(() => {
  return props.achievements.filter(achievement => achievement.unlocked)
})

const closeAchievements = () => {
  emit('close')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>

<style scoped>
.achievements {
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

.achievements-header {
  padding: 20px;
  border-bottom: 1px solid #495057;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.achievements-header h2 {
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

.achievements-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.achievements-stats {
  display: flex;
  justify-content: space-around;
  background-color: #495057;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #adb5bd;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffc107;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-card {
  background-color: #495057;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  gap: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  opacity: 0.6;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.achievement-card.unlocked {
  opacity: 1;
  border-left: 4px solid #ffc107;
}

.achievement-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

.achievement-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.8rem;
}

.achievement-rarity {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.achievement-date {
  color: #adb5bd;
}

.achievement-description {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #ced4da;
}

.achievement-requirement {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .achievements {
    width: 100vw;
  }
  
  .achievements-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .achievement-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .achievement-meta {
    flex-direction: column;
    gap: 5px;
    align-items: center;
  }
}
</style>