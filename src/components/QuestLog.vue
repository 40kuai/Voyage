<template>
  <div class="quest-log">
    <div class="quest-log-header">
      <h2>任务日志</h2>
      <button @click="closeQuestLog" class="close-button">×</button>
    </div>
    
    <div class="quest-log-content">
      <div v-if="quests.length === 0" class="empty-quests">
        暂无任务
      </div>
      
      <div v-else class="quest-list">
        <div v-for="quest in sortedQuests" :key="quest.id" class="quest-card" :class="quest.status">
          <div class="quest-header">
            <h3>{{ quest.name }}</h3>
            <span class="quest-level">等级 {{ quest.level }}</span>
            <span class="quest-status">{{ getQuestStatusName(quest.status) }}</span>
          </div>
          
          <div class="quest-description">
            {{ quest.description }}
          </div>
          
          <div class="quest-objectives">
            <h4>任务目标:</h4>
            <ul class="objectives-list">
              <li v-for="objective in quest.objectives" :key="objective.id" class="objective-item">
                <span class="objective-text">{{ objective.description }}</span>
                <span class="objective-progress">{{ objective.current || 0 }}/{{ objective.required }}</span>
                <div class="progress-bar">
                  <div class="progress-fill objective-progress" :style="{ width: (objective.current || 0) / objective.required * 100 + '%' }"></div>
                </div>
              </li>
            </ul>
          </div>
          
          <div class="quest-rewards">
            <h4>奖励:</h4>
            <div class="rewards-list">
              <span v-if="quest.rewards.experience" class="reward-item">
                {{ quest.rewards.experience }} 经验值
              </span>
              <span v-if="quest.rewards.gold" class="reward-item">
                {{ quest.rewards.gold }} 金币
              </span>
              <span v-for="(item, index) in quest.rewards.items" :key="index" class="reward-item">
                {{ item.name }}
              </span>
            </div>
          </div>
          
          <div class="quest-actions">
            <button v-if="canAcceptQuest(quest)" @click="acceptQuest(quest)" class="accept-button">
              接受任务
            </button>
            <button v-else-if="canTurnInQuest(quest)" @click="turnInQuest(quest)" class="turn-in-button">
              提交任务
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  getQuestStatusName,
  canAcceptQuest,
  canTurnInQuest,
  sortQuests,
  getQuestProgressPercentage
} from '../utils/questUtils'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  quests: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'accept-quest', 'turn-in-quest'])

const sortedQuests = computed(() => sortQuests(props.quests))

const closeQuestLog = () => {
  emit('close')
}

const acceptQuest = (quest) => {
  emit('accept-quest', quest)
}

const turnInQuest = (quest) => {
  emit('turn-in-quest', quest)
}
</script>

<style scoped>
.quest-log {
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

.quest-log-header {
  padding: 20px;
  border-bottom: 1px solid #495057;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quest-log-header h2 {
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

.quest-log-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.empty-quests {
  text-align: center;
  padding: 40px;
  color: #adb5bd;
  font-size: 1.2rem;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quest-card {
  background-color: #495057;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.quest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.quest-card.available {
  border-left: 4px solid #1eff00;
}

.quest-card.accepted {
  border-left: 4px solid #007bff;
}

.quest-card.completed {
  border-left: 4px solid #ffc107;
}

.quest-card.turned_in {
  border-left: 4px solid #6c757d;
  opacity: 0.8;
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.quest-header h3 {
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
}

.quest-level {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.quest-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.quest-status:contains("可接受") {
  background-color: #1eff00;
  color: #000;
}

.quest-status:contains("进行中") {
  background-color: #007bff;
}

.quest-status:contains("已完成") {
  background-color: #ffc107;
  color: #000;
}

.quest-status:contains("已提交") {
  background-color: #6c757d;
}

.quest-description {
  margin-bottom: 15px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #ced4da;
}

.quest-objectives {
  margin-bottom: 15px;
}

.quest-objectives h4,
.quest-rewards h4 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #ffc107;
}

.objectives-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.objective-item {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.objective-text {
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.objective-progress {
  font-size: 0.8rem;
  color: #adb5bd;
  align-self: flex-end;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.objective-progress {
  background-color: #28a745;
}

.quest-rewards {
  margin-bottom: 15px;
}

.rewards-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.reward-item {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.quest-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.accept-button,
.turn-in-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.accept-button {
  background-color: #28a745;
  color: white;
}

.accept-button:hover {
  background-color: #218838;
}

.turn-in-button {
  background-color: #ffc107;
  color: #212529;
  font-weight: bold;
}

.turn-in-button:hover {
  background-color: #e0a800;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quest-log {
    width: 100vw;
  }
  
  .quest-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quest-status {
    align-self: flex-start;
  }
}
</style>