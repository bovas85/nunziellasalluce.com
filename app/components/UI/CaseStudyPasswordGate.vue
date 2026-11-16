<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

defineOptions({ name: "CaseStudyPasswordGate" });

const props = withDefaults(
  defineProps<{
    projectTitle?: string;
  }>(),
  {
    projectTitle: "",
  },
);

const emit = defineEmits<{
  (e: "unlocked"): void;
}>();

const route = useRoute();
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const formattedTitle = computed(() => {
  if (!props.projectTitle) return "Protected Case Study";
  return props.projectTitle
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
});

const fetchFn =
  (typeof globalThis !== "undefined" && globalThis.$fetch) || $fetch;

const handleSubmit = async () => {
  const trimmed = password.value.trim();
  if (!trimmed || loading.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const res = await fetchFn<{ success: boolean; error?: string }>(
      "/api/verify-access",
      {
        method: "POST",
        body: { password: trimmed },
      },
    );

    if (res?.success) {
      emit("unlocked");
    } else {
      errorMessage.value =
        res?.error || "Incorrect password. Please try again.";
    }
  } catch (err: unknown) {
    const fetchErr = err as { data?: { error?: string } };
    errorMessage.value =
      fetchErr?.data?.error || "Incorrect password. Please try again.";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const queryPass = (route?.query?.p ||
    route?.query?.password ||
    route?.query?.pass) as string | undefined;
  if (queryPass && typeof queryPass === "string" && queryPass.trim()) {
    password.value = queryPass.trim();
    await handleSubmit();
  }
});
</script>

<template>
  <div class="password-gate" data-testid="password-gate">
    <div class="gate-card">
      <div class="lock-icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <span class="badge">Protected Work</span>

      <h1 class="title">{{ formattedTitle }}</h1>

      <p class="description">
        This client case study contains confidential material and is password
        protected. Please enter your access password below to view the project.
      </p>

      <form class="gate-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label for="case-study-password" class="label">Access Password</label>
          <div class="control">
            <input
              id="case-study-password"
              v-model="password"
              type="password"
              name="password"
              required
              autocomplete="current-password"
              placeholder="Enter password"
              :disabled="loading"
              :aria-invalid="errorMessage ? 'true' : 'false'"
              aria-describedby="gate-error-message"
              class="input"
            />
          </div>
        </div>

        <p
          v-if="errorMessage"
          id="gate-error-message"
          role="alert"
          aria-live="polite"
          class="error"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="button-unlock"
          :disabled="loading"
          :aria-busy="loading"
        >
          <span v-if="loading">Verifying...</span>
          <span v-else>Unlock Case Study</span>
        </button>
      </form>

      <div class="footer-link">
        <NuxtLink to="/" class="back-link">
          &larr; Return to All Projects
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$navy: #00172c;
$peach: #f4a261;
$navy-surface: #0a233d;

.password-gate {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $gap;
  background-color: $navy;
  color: white;
}

.gate-card {
  width: 100%;
  max-width: 520px;
  background-color: $navy-surface;
  border: 1px solid rgb(244 162 97 / 30%);
  border-radius: 16px;
  padding: $gap * 1.5;
  box-shadow: 0 20px 40px rgb(0 0 0 / 40%);
  text-align: center;

  @include media(sm) {
    padding: $gap * 2;
  }
}

.lock-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto $gap * 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgb(244 162 97 / 15%);
  color: $peach;

  svg {
    width: 28px;
    height: 28px;
  }
}

.badge {
  display: inline-block;
  font-size: $font-small;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: $peach;
  margin-bottom: 12px;
}

.title {
  @include size(h2);

  color: white;
  margin-bottom: 16px;
}

.description {
  font-size: $font-medium;
  color: #c0cad3;
  line-height: 1.6;
  margin-bottom: $gap;
}

.gate-form {
  text-align: left;
}

.field {
  margin-bottom: 18px;
}

.label {
  display: block;
  font-size: $font-medium;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.control {
  position: relative;
}

.input {
  width: 100%;
  padding: 12px 16px;
  font-size: $font-size;
  color: white;
  background-color: $navy;
  border: 1px solid rgb(244 162 97 / 40%);
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  outline: none;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    border-color: $peach;
    box-shadow: 0 0 0 3px rgb(244 162 97 / 30%);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.error {
  color: #ff6b6b;
  font-size: $font-medium;
  margin-bottom: 16px;
  font-weight: 600;
}

.button-unlock {
  width: 100%;
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: $navy;
  background-color: $peach;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background-color: lighten($peach, 8%);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgb(244 162 97 / 40%);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.footer-link {
  margin-top: $gap;
  padding-top: $gap * 0.75;
  border-top: 1px solid rgb(255 255 255 / 10%);
}

.back-link {
  color: $peach;
  font-size: $font-medium;
  text-decoration: none;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: lighten($peach, 12%);
    text-decoration: underline;
  }
}
</style>
