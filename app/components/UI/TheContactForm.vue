<script setup lang="ts">
import Config from "@/assets/config";
import { useLocalStorage, useNetwork } from "@vueuse/core";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const { isOnline } = useNetwork();

const sending = ref(false);
const saved = ref(false);
const nameClicked = ref(false);
const emailClicked = ref(false);
const nameFocused = ref(false);
const emailFocused = ref(false);
const messageFocused = ref(false);
const honeypot = ref("");

const form = ref({
  yourName: "",
  yourEmail: "",
  yourMessage: "",
  youAgree: false,
});

const disabled = ref(false);
const error = ref(false);
const sendError = ref(false);
const sent = ref(false);
const showSaveConfirmation = ref(false);

const storedData = useLocalStorage("contactFormData", null as string | null);

onMounted(() => {
  if (storedData.value) {
    saved.value = true;
    try {
      form.value = JSON.parse(storedData.value);
      disabled.value = false;
    } catch {
      // Invalid stored data, ignore
    }
  }
});

onBeforeUnmount(() => {
  resetForm();
});

const resetForm = () => {
  form.value = {
    yourName: "",
    yourEmail: "",
    yourMessage: "",
    youAgree: false,
  };
  nameClicked.value = false;
  emailClicked.value = false;
  sent.value = false;
  saved.value = false;
};

// Basic validation rules
const vNameInvalid = computed(() => form.value.yourName.trim() === "");
const vEmailInvalid = computed(() => {
  const email = form.value.yourEmail.trim();
  return email === "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
});
const vFormInvalid = computed(
  () => vNameInvalid.value || vEmailInvalid.value || !form.value.youAgree,
);

const checkValidation = computed(() => {
  if (!sending.value) return false;
  if (vEmailInvalid.value && emailClicked.value) return true;
  if (vNameInvalid.value && nameClicked.value) return true;
  if (!form.value.youAgree) return true;
  return false;
});

const saveOfflineForm = () => {
  const formStorage = {
    yourName: form.value.yourName,
    yourEmail: form.value.yourEmail,
    yourMessage: form.value.yourMessage,
    youAgree: form.value.youAgree,
  };
  storedData.value = JSON.stringify(formStorage);
  showSaveConfirmation.value = true;
  setTimeout(() => {
    showSaveConfirmation.value = false;
  }, 2000);
};

const submitFormAPI = async () => {
  const formData = new FormData();
  formData.append("_wpcf7", "78");
  formData.append("_wpcf7_version", "5.9");
  formData.append("_wpcf7_locale", "en_GB");
  formData.append("_wpcf7_unit_tag", "wpcf7-f78-p235-o1");
  formData.append("your-name", form.value.yourName);
  formData.append("your-email", form.value.yourEmail);
  formData.append("your-message", form.value.yourMessage);
  formData.append("acceptance-privacy", form.value.youAgree ? "1" : "");

  try {
    await $fetch(`${Config.wpDomain}${Config.api.postFormContact}`, {
      method: "POST",
      body: formData,
    });
    disabled.value = false;
    sending.value = false;
  } catch {
    disabled.value = false;
    sending.value = false;
    sendError.value = true;
    error.value = true;
    sent.value = false;
  }
};

const sendForm = async () => {
  if (!isOnline.value) {
    saveOfflineForm();
    return false;
  }

  if (honeypot.value !== "") {
    return false;
  }

  sending.value = true;
  sendError.value = false;
  error.value = false;

  if (vNameInvalid.value) {
    form.value.yourEmail = "";
    setTimeout(() => {
      sending.value = false;
    }, 5000);
    return false;
  }

  if (vFormInvalid.value) {
    error.value = true;
    setTimeout(() => {
      sending.value = false;
    }, 5000);
  } else {
    sent.value = true;
    disabled.value = true;
    await submitFormAPI();
  }
};
</script>

<template>
  <div class="contact-form">
    <form
      key="notSent"
      :class="{ sending: sent }"
      class="go-bottom is-flex-column"
      @submit.prevent
    >
      <div class="name">
        <label :class="{ selected: nameFocused || saved }" for="name"
          >Full Name</label
        >
        <input
          id="name"
          v-model="form.yourName"
          autocomplete="given-name"
          :class="{
            'is-danger':
              (vNameInvalid && sending) || (vNameInvalid && nameClicked),
          }"
          name="name"
          type="text"
          required
          @focus="nameFocused = true"
          @blur="nameClicked = true"
        />
        <i
          :class="{
            'is-danger':
              (vNameInvalid && sending) || (vNameInvalid && nameClicked),
          }"
          ><img src="/images/error.svg" alt="error icon"
        /></i>
        <span
          :class="{
            'is-visible':
              (vNameInvalid && sending) || (vNameInvalid && nameClicked),
          }"
          class="has-text-danger"
          >Please type your full name</span
        >
      </div>

      <div class="email">
        <label :class="{ selected: emailFocused || saved }" for="email"
          >Email</label
        >
        <input
          id="email"
          v-model="form.yourEmail"
          autocomplete="email"
          :class="{
            'is-danger':
              (vEmailInvalid && sending) || (vEmailInvalid && emailClicked),
          }"
          name="email"
          type="email"
          required
          @focus="emailFocused = true"
          @blur="emailClicked = true"
        />
        <i
          :class="{
            'is-danger':
              (vEmailInvalid && sending) || (vEmailInvalid && emailClicked),
          }"
          ><img src="/images/error.svg" alt="error icon"
        /></i>
        <span
          :class="{
            'is-visible':
              (vEmailInvalid && sending) || (vEmailInvalid && emailClicked),
          }"
          class="has-text-danger"
          >Please type a valid Email</span
        >
      </div>

      <div class="message">
        <label
          :class="{ selected: messageFocused || saved }"
          for="message"
          @focus="messageFocused = true"
          >Message</label
        >
        <textarea
          id="message"
          v-model="form.yourMessage"
          class="hidden-mobile"
          rows="5"
          name="message"
        />
        <textarea
          id="message_mobile"
          v-model="form.yourMessage"
          class="is-hidden-mobile-large"
          rows="1"
          placeholder="Write your message here ..."
          name="message_mobile"
        />
      </div>

      <div class="check">
        <input id="check1" v-model="form.youAgree" type="checkbox" required />
        <label
          :class="{
            opacity: form.youAgree,
            'is-danger': !form.youAgree && sending,
          }"
          class="checkbox label"
          for="check1"
        >
          <p>
            You agree to the
            <NuxtLink
              to="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              >Privacy Policy</NuxtLink
            >
          </p>
          <span
            :class="{ 'is-visible': !form.youAgree && sending }"
            class="has-text-danger"
            >Please agree with the Privacy Policy</span
          >
        </label>
      </div>

      <div class="field is-grouped">
        <div class="control">
          <input
            v-model="honeypot"
            type="text"
            hidden
            autocomplete="off"
            class="hidden honeypot"
          />
          <button
            :disabled="disabled || saved"
            :class="{ 'is-disabled': disabled || saved }"
            class="button button--contact"
            @click.prevent="sendForm()"
          >
            {{ isOnline ? "Submit" : "Save" }}
          </button>
        </div>
      </div>

      <p v-show="sendError" class="is-danger col--12 is-left send-error">
        There was an error sending the form.
      </p>
      <p v-show="checkValidation" class="is-danger col--12 is-left send-error">
        There is an error in one of the fields. Please review your previous
        answers
      </p>
    </form>

    <div class="sent" :class="{ 'is-visible': sent }">
      <h4>Submitted</h4>
      <p>
        Your message has been successfully submitted, we will get in touch with
        you shortly.
      </p>
      <div class="field is-grouped">
        <div class="control">
          <NuxtLink class="button button--sent" to="/">Go Home</NuxtLink>
        </div>
      </div>
    </div>

    <div class="sent" :class="{ 'is-visible': showSaveConfirmation }">
      <h4>Saved</h4>
      <p>
        Your message has been successfully saved, if you come back here it will
        be prefilled.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contact-form {
  background: white;
  padding: $gap * 1.5 $gap calc($gap / 2);
  max-width: 100%;
  width: 100%;
  margin: 0;

  @include media(lg) {
    border: 8px solid $yellow;
    padding: $gap $gap * 2;
    width: $tablet;
    max-width: $tablet;
  }
}

p {
  margin: 0;
  padding: 0 0 10px;
  line-height: 2;
  color: $secondary;
  font-weight: 300;
  font-size: 16px;
  margin-bottom: 20px;
}

.sent {
  opacity: 0;
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  max-height: 0%;
  transition: all 0.3s ease-in-out;
  min-height: 200px;
  z-index: -1;

  @include media(md) {
    min-height: 445px;
  }

  h4 {
    font-size: 18px;
    text-transform: uppercase;
  }

  &.is-visible {
    position: relative;
    opacity: 1;
    max-height: 100%;
    z-index: 1;
  }

  p {
    line-height: 1.2;
    font-weight: 600;
    font-size: $font-size;
  }
}

.is-danger {
  color: $red;
  margin-left: 0;
  text-align: left;
}

h2 {
  color: $secondary;
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 400;
  text-align: left;
  letter-spacing: 1.8px;
  margin: 0 0 4px;

  @media (min-width: $tablet) {
    font-size: 24px;
  }

  span.red {
    color: $red;
    line-height: 1;
  }
}

h4 {
  font-size: 22px;
  line-height: 22px;
  color: $secondary;
  letter-spacing: 0.4px;
  margin: 0 0 24px;
  padding: 0;
  font-weight: 700;
}

form {
  row-gap: 0;

  &.sending {
    display: none;
  }

  .check {
    display: block;
    margin: 20px 0 0;

    p {
      margin-bottom: 0;
      padding-bottom: 0;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.43;
      letter-spacing: 0.3px;
      text-align: left;
      color: $secondary;
    }
  }

  .checkbox {
    font-size: 14px;
    font-weight: 300;
    line-height: 1.36;
    cursor: pointer;
    letter-spacing: 0.2px;
    text-align: left;
    color: $secondary;
    padding-top: 0;
    margin: 0;
    opacity: 1 !important;

    a {
      color: $secondary;
      font-weight: 600;

      &:hover {
        color: $secondary;
        text-decoration: underline;
      }
    }

    span {
      &.is-visible {
        margin-bottom: 0 !important;
      }
    }
  }

  input[type="checkbox"] {
    visibility: visible !important;
    position: absolute;
    opacity: 0;
    height: 0 !important;

    &:focus {
      ~ label::before {
        border: 2px solid $secondary;
      }
    }
  }

  .checkbox::after {
    background-image: url("/images/tick.svg");
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
    content: "";
    width: 32px;
    height: 32px;
    line-height: 1;
    font-size: 0;
    position: absolute;
    top: -5px;
    left: 0;
    opacity: 0;
    color: $secondary;

    @include media(md) {
      top: 1px;
      left: -1px;
    }
  }

  label {
    &.checkbox {
      &.opacity {
        &::after {
          opacity: 1 !important;
        }
      }

      height: 33px;
      position: relative;
      padding-left: 44px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-size: 12px;

      &::before {
        content: "";
        background-color: transparent;
        border: solid 1px $secondary;
        padding: 14px;
        display: block;
        border-radius: 2px;
        position: absolute;
        left: 0;
        top: -5px;

        @include media(md) {
          top: 3px;
        }
      }

      &.is-danger {
        &::before {
          border: solid 2px #ffd2d2;
        }
      }

      &:checked {
        &::before {
          border: solid 1px $secondary;
          color: $secondary;
        }
      }

      &:hover {
        &::before {
          border: solid 2px $secondary;
        }
      }
    }
  }

  input:checked + label::before {
    border: 1px solid $secondary;
    color: #99a1a7;
  }

  .honeypot {
    visibility: hidden;
    height: 0;
    font-size: 0;
    width: 0;
    position: absolute;
    text-indent: 9999px;
  }

  span {
    visibility: hidden;
    display: block;

    &.is-visible {
      visibility: visible;
      margin-bottom: $gap;
    }
  }

  .email {
    margin-bottom: $gap;
  }
}

label {
  line-height: 1;
  color: $secondary;
  margin-bottom: 12px;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 14px;

  &.error {
    color: $red;
  }
}

input {
  margin: 12px 0 20px;
  height: 50px;
  font-size: $font-size;
  border: 0 solid transparent;
  border-bottom: 1px solid $secondary;
  width: 100%;
  background-color: white;
  color: $secondary;
  box-shadow: unset;
  outline: none;
  padding: 10px;
  transition: all 0.3s ease-in-out;

  &.error {
    border-bottom-color: $red;
  }

  &:focus {
    border-bottom: 2px solid $secondary;
    outline: unset;
  }

  &.correct {
    background-image: url("/images/tick.svg");
    background-repeat: no-repeat;
    background-position: 98% 50%;
  }

  &.is-danger {
    border-bottom: 2px solid $red;
  }
}

.emailErrorMsg {
  color: $red;
  font-size: 16px;
  margin: 0 0 10px;
  padding: 0;
  display: none;
}

.name,
.email {
  label {
    transform: translate(0, 32px);
    display: block;
    position: absolute;
    transition: transform 0.3s ease-in-out;

    &.selected {
      transform: translate(0, -15px);
    }
  }
}

.name,
.email {
  position: relative;

  i {
    position: absolute;
    top: $gap;
    right: 8px;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;

    &.is-danger {
      opacity: 1;
    }
  }
}

textarea {
  border: 0 solid $secondary;
  font-size: $font-size;
  font-family: $family-primary;
  border-bottom: 1px solid $secondary;
  background-color: white !important;
  height: 100px;
  width: 100%;
  outline: none !important;
  margin: 10px 0 0;
  padding: 10px;
  color: $grey;
  resize: vertical;

  &.error {
    border-bottom-color: $red;
  }

  &:focus {
    border-bottom: 2px solid $secondary;
  }
}

.container {
  width: 100%;
  max-width: 540px;
  padding-top: 54px;
}

.contact-modal {
  .container {
    max-width: 500px;
  }

  form {
    padding-top: 24px;
  }

  .is-flex {
    align-items: center;
    justify-content: space-between;

    i {
      color: $secondary;
      font-size: 12px;
      cursor: pointer;
    }
  }
}
</style>
