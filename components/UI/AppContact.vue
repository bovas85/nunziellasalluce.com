<template>
  <div :class="{'is-modal': isModal}">
    <div class="container">

      <div class="contact-form" v-if="page != null && page.content != null">
        <div class="is-flex">
          <h2>Contact us <span class="red">/</span></h2>
          <i v-show="isModal" @click="$emit('closeModal') " class="fa fa-cancel"></i>
        </div>
        <hr>
        <div v-if="page != null && !$root.sent &&  page.content != null" class="rendered-content" v-html="page.acf.header.body"></div>

        <form key="notSent" :class="{'sending': $root.sent}" @submit.prevent class="go-bottom grid-wrapper">
            <div class="name name--first col--6-tablet">
                <label for="name">First Name</label>
                <input autocomplete="given-name" @blur="nameClicked = true" :class="{'is-danger': !$v.form.yourFirstName && sending || !$v.form.yourFirstName && nameClicked}" v-model="form.yourFirstName" id="name" name="name" type="text" required>
                <span :class="{'is-visible': $v.form.yourFirstName.$invalid && sending || $v.form.yourFirstName.$invalid && nameClicked}" class="has-text-danger">Please type a Name</span>
            </div>

            <div class="name name--last col--6-tablet">
                <label for="surname">Last Name</label>
                <input autocomplete="family-name" @blur="surnameClicked = true" :class="{'is-danger': !$v.form.yourLastName && sending || !$v.form.yourLastName && surnameClicked}" v-model="form.yourLastName" id="surname" name="surname" type="text" required>
                <span :class="{'is-visible': $v.form.yourLastName.$invalid && sending || $v.form.yourLastName.$invalid && surnameClicked}" class="has-text-danger">Please type a Surname</span>
            </div>

            <div class="email">
                <label for="email">Email</label>
                <input autocomplete="email" @blur="emailClicked = true" :class="{'is-danger': !$v.form.yourEmail && sending || !$v.form.yourEmail && emailClicked}" v-model="form.yourEmail" id="email" name="email" type="email" required>
                <span :class="{'is-visible': $v.form.yourEmail.$invalid && sending || $v.form.yourEmail.$invalid && emailClicked}" class="has-text-danger">Please type an Email</span>
            </div>

            <div class="message">
                <label for="message">Message</label>
                <textarea class="hidden-mobile" rows="5" v-model="form.yourMessage" id="message" name="message"></textarea>
                <textarea class="is-hidden-mobile-large" rows="1" placeholder="Write your message here ..." v-model="form.yourMessage" id="message_mobile" name="message_mobile"></textarea>
            </div>

            <div class="check">
              <input id="check1" v-model="form.youAgree" type="checkbox" required>
              <label :class="{'opacity': form.youAgree, 'is-danger': $v.form.youAgree.$invalid && sending}" class="checkbox label" for="check1">
                  <p>I accept 's <nuxt-link to="/privacy-policy">terms &amp; conditions</nuxt-link></p>
                  <span :class="{'is-visible': $v.form.youAgree.$invalid && sending}" class="has-text-danger">Please agree with the Privacy Policy</span>
              </label>

            </div>

            <div class="check">

              <input id="check2" v-model="form.subscribe" type="checkbox">
              <label for="check2" :class="{'opacity': form.subscribe}" class="checkbox label">
                  <p>Please send me exclusive updates from the travel journal</p>
              </label>
            </div>

              <!-- <label :class="{'opacity': $v.form.youAgree, 'is-danger': !$v.form.youAgree && sending}" class="checkbox label">
                  <input v-model="form.youAgree" type="checkbox" required><span>I accept 's <nuxt-link to="/privacy-policy">terms &amp; conditions</nuxt-link></span>
                  <span :class="{'is-visible': !$v.form.youAgree && sending}" class="has-text-danger">Please agree with the Privacy Policy</span>
              </label> -->

            <div class="field is-grouped">
                <div class="control">
                    <input type="text" hidden autocomplete="off" v-model="honeypot" class="hidden honeypot" />
                    <button v-smooth-scroll="{element:'.go-bottom'}" :disabled="disabled || saved" :class="{'is-disabled': disabled || saved}" @click.prevent="sendForm()" class="button button--contact">{{ $store.state.connection !== 'none' ? 'Submit' : 'Save'}}</button>
                </div>
            </div>

            <p class="is-danger col--12 is-left send-error" v-show="sendError">There was an error sending the form.</p>
            <p class="is-danger col--12 is-left send-error" v-show="checkValidation">There is an error in one of the fields. Please review your previous answers</p>
        </form>

        <div class="sent" :class="{'is-visible': $root.sent}">
          <h4>Submitted</h4>
          <p>
            Your message has been successfully submitted, we will get in touch with you shortly.
            <br>
            <br>
            In the meantime you can follow us and keep on discovering.
          </p>
        </div>

        <div class="sent" :class="{'is-visible': showSaveConfirmation}">
          <h4>Saved</h4>
          <p>
            Your message has been successfully saved, if you come back here it will be prefilled.
          </p>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
  import Config from "~/assets/config";
  import { required, email } from "vuelidate/lib/validators";

  export default {
    name: "AppContact",
    props: {
      page: {
        type: Object,
        default: null
      },
      isModal: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        sending: false,
        $v: null,
        nameClicked: false,
        surnameClicked: false,
        emailClicked: false,
        honeypot: "",
        form: {
          yourFirstName: "",
          yourLastName: "",
          yourEmail: "",
          yourMessage: "",
          youAgree: false,
          subscribe: false
        },
        disabled: false,
        error: false,
        sendError: false,
        sent: false,
        saved: false,
        notSent: true,
        showSaveConfirmation: false
      };
    },
    validations: {
      form: {
        yourFirstName: {
          required
        },
        yourLastName: {
          required
        },
        yourEmail: {
          required,
          email
        },
        youAgree: {
          required
        }
      }
    },
    mounted () {
      if (this.$localStorage.get("AntForm")) {
        // console.log("local storage found, populating");
        let form = JSON.parse(this.$localStorage.get("AntForm"));
        this.form = form;
        this.disabled = false;
        return;
      }
    },
    beforeDestroy () {
      this.resetForm();
    },
    methods: {
      resetForm () {
        let newForm = {
          yourFirstName: "",
          yourLastName: "",
          yourEmail: "",
          youAgree: false,
          subscribe: false
        };
        this.nameClicked = false;
        this.surnameClicked = false;
        this.emailClicked = false;
        this.form = newForm;
        this.$root.sent = false;
        this.saved = false;
      },
      sendForm () {
        if (this.$store.state.connection === "none") {
          let formStorage = {
            yourFirstName: this.form.yourFirstName,
            yourLastName: this.form.yourLastName,
            yourEmail: this.form.yourEmail,
            message: this.form.yourMessage,
            youAgree: this.form.youAgree,
            subscribe: this.form.subscribe
          };
          this.$localStorage.set("AntForm", JSON.stringify(formStorage));
          this.showSaveConfirmation = true;
          setTimeout(() => {
            this.showSaveConfirmation = false;
          }, 2000);
          return false;
        }
        if (this.honeypot || this.honeypot !== "") {
          // bot prevention
          return false;
        }
        this.sending = true;
        this.sendError = false;
        this.error = false;
        if (this.$v.form.yourFirstName.$invalid) {
          // console.log('email not valid')
          this.form.yourEmail = "";
          setTimeout(() => {
            // this.error = false
            this.sending = false;
            return false;
          }, 5000);
          return false;
        }
        if (this.$v.form.$invalid || !this.form.youAgree) {
          this.error = true;
          setTimeout(() => {
            this.sending = false;
            return false;
          }, 5000);
        } else {
          this.$root.sent = true;
          this.disabled = true;
          var formData = new FormData();
          formData.append("first-name", this.form.yourFirstName);
          formData.append("last-name", this.form.yourLastName);
          formData.append("your-email", this.form.yourEmail);
          formData.append("message", this.form.yourMessage);
          formData.append("subscribe", this.form.subscribe);
          this.$axios
            .post(`${Config.client}${Config.api.postFormContact}`, formData)
            .then(res => {
              this.disabled = false;
              this.sending = false;
            })
            .catch(err => {
              console.log('contact send error', err);
              this.disabled = false;
              this.sending = false;
              this.sendError = true;
              this.error = true;
              this.$root.sent = false;
            });
            try {
              this.$ga.event({
                eventCategory: 'form',
                eventAction: 'submit',
                eventLabel: 'contact',
                eventValue: 0
              })
              setTimeout(() => {
                window.scrollTo(0, 350);
              }, 700)
            } catch (e) {}
        }
      }
    },
    computed: {
      checkValidation () {
        if (!this.sending) {
          return false;
        } else if (this.sending) {
          if (!this.$v.form.yourEmail.$invalid && this.emailClicked) {
            return true;
          } else if (!this.$v.form.yourFirstName.$invalid && this.nameClicked) {
            return true;
          } else if (!this.$v.form.yourLastName.$invalid && this.surnameClicked) {
            return true;
          } else if (!this.$v.form.youAgree.$invalid) {
            return true;
          } else return false;
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  // ~ refers to root here, its not the same as ~/
  @import "~assets/css/forms";

  .body {
    overflow: hidden;
    p {
      margin: 0;
      padding: 0 0 10px 0;
      line-height: 2;
      color: #9b9b9b;
      font-weight: 300;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .sent {
      opacity: 0;
      position: fixed;
      height: 100%;
      max-height: 100%;
      transition: all 0.3s ease-in-out;
      &.is-visible {
        position: relative;
        opacity: 1;
      }
      p {
        line-height: 1.2;
        max-width: 85%;
      }
    }
    .is-danger {
      color: $red;
      margin-left: 0;
      text-align: left;
    }
  }
  h2 {
    color: $secondary;
    text-transform: uppercase;
    font-size: 18px;
    font-weight: 400;
    text-align: left;
    letter-spacing: 1.8px;
    margin: 0 0 4px 0;
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
    color: #002650;
    letter-spacing: 0.4px;
    margin: 0 0 24px 0;
    padding: 0;
    font-weight: 700;
  }
  hr {
    border: 0;
    border-top: 1px solid #b4b5b3;
    margin-bottom: 28px;
    margin-top: 16px;
  }
  form {
    grid-row-gap: 0;
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
        color: #686868;
      }
    }
    .checkbox {
      font-size: 14px;
      font-weight: 300;
      line-height: 1.36;
      cursor: pointer;
      letter-spacing: 0.2px;
      text-align: left;
      color: #646362;
      padding-top: 0;
      margin: 0;
      opacity: 1 !important;
      a {
        &:hover {
          color: $secondary;
        }
      }
    }

    input[type='checkbox'] {
      visibility: visible !important;
      position: absolute;
      opacity: 0;
      height: 0 !important;
      &:focus {
        ~ label:before {
          border: 2px solid $secondary;
        }
      }
    }

    .checkbox:after {
      background-image: url("/images/tick.svg");
      background-repeat: no-repeat;
      background-size: 70%;
      background-position: center;
      content: "";
      width: 32px;
      height: 32px;
      line-height: 1;
      font-size: 0px;
      position: absolute;
      top: 1px;
      left: -1px;
      opacity: 0;
      color: $secondary;
    }

    label {
      &.checkbox {
        &.opacity {
          &:after {
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
        &:before {
          content: "";
          background-color: #fff;
          border: solid 1px #ccc;
          padding: 14px;
          display: block;
          border-radius: 2px;
          position: absolute;
          top: 3px;
          left: 0;
        }
        &.is-danger {
          &:before {
            border: solid 2px #ffd2d2;
          }
        }
        &:checked {
          &:before {
            border: solid 1px $secondary;
            color: $secondary;
          }
        }
        &:hover {
          &:before {
            border: solid 2px $secondary;
          }
        }
      }
    }

    input:checked + label:before {
      border: 1px solid $secondary;
      color: #99a1a7;
    }

    .honeypot {
      visibility: hidden;
      height: 0;
      font-size: 0px;
      width: 0;
      position: absolute;
      text-indent: 9999px;
    }
    span {
      display: none;
      &.is-visible {
        display: block;
      }
    }
  }
  .mutli-title {
    line-height: 16px;
    color: $secondary;
    margin-bottom: 16px;
    font-weight: 300;
    font-size: 16px;
  }
  label {
    line-height: 16px;
    color: $secondary;
    margin-bottom: 12px;
    font-weight: 300;
    font-size: 16px;
    &.error {
      color: #ed334a;
    }
  }
  input {
    margin: 12px 0 20px 0;
    height: 50px;
    border: 1px solid #e1dfdc;
    width: 100%;
    background-color: #fafafa;
    color: $grey;
    box-shadow: unset;
    outline: none;
    padding: 10px;
    transition: background 0.3s ease-in-out;
    &:hover {
      border: 1px solid #e1dfdc;
      background-color: #fff;
    }

    &.error {
      border-color: #ed334a;
    }

    &:focus {
      border: 2px solid $secondary;
    }

    &.correct {
      background-image: url("/images/tick.svg");
      background-repeat: no-repeat;
      background-position: 98% 50%;
    }
  }
  .emailErrorMsg {
    color: #ed334a;
    font-size: 16px;
    margin: 0 0 10px 0px;
    padding: 0;
    display: none;
  }
  textarea {
    border: 1px solid #e1dfdc;
    background-color: #fafafa;
    height: 100px;
    width: 100%;
    margin: 12px 0 0 0;
    color: $grey;
    resize: vertical;
    &.error {
      border-color: red;
    }
    &:focus {
      background: #fff;
      border: 2px solid $secondary;
    }
  }
  .recaptchaError {
    display: none;
    color: red;
    margin-bottom: 0;
  }
  button {
    margin-top: 20px;
    margin-bottom: 20px;
    &:focus {
      box-shadow: 0 0 0 1px $secondary;
    }
  }
  .thank-you {
    padding: 70px 0 96px 0;
    display: none;
  }
  .mutli-select {
    padding: 7px 9px 7px 9px;
    background-color: #fafafa;
    border: 1px solid #e1dfdc;
    width: 232px;
    @media (min-width: $tablet) {
      width: 322px;
    }
    height: 50px;
    margin-bottom: 20px;

    label {
      cursor: pointer;
      display: block;
      float: left;
      background-color: #fafafa;
      color: $grey;
      width: 70px;
      @media (min-width: $tablet) {
        width: 100px;
      }
      height: 35px;
      text-align: center;
      line-height: 35px;
      font-size: 16px;
    }

    label.selected {
      background-color: $secondary;
      color: white;
    }

    input[type="radio"] {
      position: absolute;
      top: -9999px;
      left: -9999px;
    }
  }
  .contact-details {
    padding-bottom: 28px;
    p {
      margin: 0;
      padding: 0 0 4px 0;
      color: #9b9b9b;
      font-weight: 300;
      font-size: 16px;
      a {
        color: inherit;
        text-decoration: none;
        border-bottom: 1px solid $red;

        &:hover {
          color: $red;
        }
      }
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
    .body {
      box-shadow: unset;
      padding: 0 32px;
    }
    hr {
      border: 0;
      border-top: 1px solid #b4b5b3;
      margin-bottom: 20px;
      margin-top: 10px;
    }
  }
</style>
