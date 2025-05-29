<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
    <h2 class="text-xl font-bold text-white mb-4">Spieleinstellungen</h2>
    
    <!-- Basic Settings -->
    <BasicSettings 
      :game-data="gameData" 
      @update:game-data="$emit('update:gameData', $event)"
    />

    <!-- Password Protection -->
    <PasswordSettings 
      :game-data="gameData"
      :use-password="usePassword"
      :show-password="showPassword"
      @update:game-data="$emit('update:gameData', $event)"
      @update:use-password="$emit('update:usePassword', $event)"
      @update:show-password="$emit('update:showPassword', $event)"
    />

    <!-- Rewards -->
    <RewardsSettings 
      :game-data="gameData"
      @update:game-data="$emit('update:gameData', $event)"
      @image-upload="handleImageUpload"
    />
  </div>
</template>

<script>
import BasicSettings from './BasicSettings.vue'
import PasswordSettings from './PasswordSettings.vue'
import RewardsSettings from './RewardsSettings.vue'

export default {
  name: 'GameSettings',
  components: {
    BasicSettings,
    PasswordSettings,
    RewardsSettings
  },
  props: {
    gameData: {
      type: Object,
      required: true
    },
    usePassword: {
      type: Boolean,
      required: true
    },
    showPassword: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:gameData', 'update:usePassword', 'update:showPassword'],
  methods: {
    handleImageUpload(event, rewardIndex) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const updatedGameData = { ...this.gameData }
          updatedGameData.rewards[rewardIndex].image = e.target.result
          this.$emit('update:gameData', updatedGameData)
        }
        reader.readAsDataURL(file)
      }
    }
  }
}
</script>