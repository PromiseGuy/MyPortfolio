<template>
  <div class="projects flex flex-col justify-center w-full h-full color-text gap-150">
    <h1 class="projects-text fw-800 flex items-center justify-center fs-54">Projects</h1>
    <div class="projects-container flex flex-row items-center w-full p-24 gap-24">
      <div v-for="project in projects" :key="project.title" class="project-item aspect-video w-600 bg-bg-light"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Project {
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
}

const projects: Project[] = [
  {
    title: "Project One",
    description: "Description for project one.",
    imageUrl: "path/to/image1.jpg",
    projectUrl: "https://projectone.com"
  },
  {
    title: "Project Two",
    description: "Description for project two.",
    imageUrl: "path/to/image2.jpg",
    projectUrl: "https://projecttwo.com"
  }
];
</script>

<style scoped lang="scss">
.project-item {

}

@media (max-width: 2500px) {
  .projects-text {
    width: 70rem;
    font-size: 3rem;
  }
}

@media (max-width: 1500px) {
  .projects-text {
    width: 50rem;
    font-size: 2rem;
  }
}

@media (max-width: 1000px) {
  .projects-text {
    width: 30rem;
    font-size: 1rem;
  }
}
</style>