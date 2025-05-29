<template>
  <div class="flex flex-col justify-center space-y-6 min-w-[180px]">
    <!-- Drink 3 (Questions 11-15) -->
    <DrinkCard 
      :reward="rewards[2]"
      color-scheme="red"
      label="Belohnung 3"
    />

    <!-- Spacer for middle questions -->
    <div class="h-4"></div>

    <!-- Drink 2 (Questions 6-10) -->
    <DrinkCard 
      :reward="rewards[1]"
      color-scheme="orange"
      label="Belohnung 2"
    />

    <!-- Spacer for bottom questions -->
    <div class="h-4"></div>

    <!-- Drink 1 (Questions 1-5) -->
    <DrinkCard 
      :reward="rewards[0]"
      color-scheme="green"
      label="Belohnung 1"
    />
  </div>
</template>

<script>
import DrinkCard from './DrinkCard.vue'

export default {
  name: 'DrinksColumn',
  components: {
    DrinkCard
  },
  props: {
    rewards: {
      type: Array,
      required: true
    }
  }
}
</script>