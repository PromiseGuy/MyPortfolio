<template>
  <div class="hero-text flex flex-col items-center justify-center gap-4 fs-54 fw-800 color-text">
    <div>You tell me your ideas</div>
    <div class="flex flex-row justify-center items-center">
      <div>- I</div>
      <div class="cycling-words relative inline-block">
        <span class="flex flex-row items-center color-primary" v-for="item in cyclingData" :key="item.word">
          <Icon :name="item.icon" size="1em" />
          {{ item.word }}
        </span>
      </div>
      <div>them.</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const cyclingData = [
  { word: 'Shape', icon: 'fluent:shape-organic-32-filled' },
  { word: 'Build', icon: 'f7:hammer-fill' },
  { word: 'Polish', icon: 'healthicons:clean-hands' },
]
</script>

<style scoped lang="scss">
.hero-text {
  line-height: 1;
}

.cycling-words {
  // position: relative;
  // display: inline-block;
  height: 1em;
  line-height: 1;
  // min-width: 13.5rem;
  overflow: hidden;

  >span {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    opacity: 0;
    transform: translateY(100%);
    animation: cycleWords 6s infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.1em;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 2s;
    }

    &:nth-child(3) {
      animation-delay: 4s;
    }
  }
}

@keyframes cycleWords {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }

  5% {
    opacity: 1;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(0);
  }

  35% {
    opacity: 0;
    transform: translateY(-100%);
  }

  100% {
    opacity: 0;
    transform: translateY(-100%);
  }
}

@media (max-width: 2500px) {
  .hero-text {
    width: 70rem;
    font-size: 3rem;
  }

  .cycling-words {
    width: 13rem;
  }
}

@media (max-width: 1500px) {
  .hero-text {
    width: 50rem;
    font-size: 2rem;
  }

  .cycling-words {
    width: 9rem;
  }
}

@media (max-width: 1000px) {
  .hero-text {
    width: 30rem;
    font-size: 1rem;
  }

  .cycling-words {
    width: 5rem;
  }
}
</style>