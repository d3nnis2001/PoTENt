<template>
  <div class="flex justify-between items-center mb-8">
    <HeaderContent @back="$emit('back')" />
    <HeaderActions 
      :has-local-data="hasLocalData"
      :selected-decks="selectedDecks"
      :total-selected-cards="totalSelectedCards"
      :get-deck-name="getDeckName"
      @migrate-data="$emit('migrate-data')"
      @play-selected="$emit('play-selected')"
      @create-game="$emit('create-game')"
    />
  </div>
</template>

<script>
import HeaderContent from './HeaderContent.vue'
import HeaderActions from './HeaderActions.vue'

export default {
  name: 'GalleryHeader',
  components: {
    HeaderContent,
    HeaderActions
  },
  props: {
    hasLocalData: {
      type: Boolean,
      required: true
    },
    selectedDecks: {
      type: Array,
      required: true
    },
    totalSelectedCards: {
      type: Number,
      required: true
    },
    getDeckName: {
      type: Function,
      required: true
    }
  },
  emits: ['back', 'migrate-data', 'play-selected', 'create-game']
}
</script>