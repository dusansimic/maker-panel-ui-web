<template>
  <div>
    <p>{{ name }}</p>
    <h2>{{ value }} <sup>{{ unit }}</sup></h2>
  </div>
</template>

<script>
export default {
  name: 'PlainValue',
  props: {
    name: {
      type: String,
      required: true
    },
    value: {
      type: null,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  }
}
</script>
