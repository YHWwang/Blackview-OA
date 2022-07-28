<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: "chart",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "200px",
    },
    usedTimeData: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      chart: null,
      data: {},
    };
  },
  watch: {
    usedTimeData(val) {
      this.data = val;
      if (!this.chart) {
        return;
      }
      this.chart.dispose();
      this.chart = null;
      this.$nextTick(() => {
        this.initChart();
      });
    },
  },
  created() {
    this.data = this.usedTimeData;
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    formatColor() {
      let color = [];
      for (const iterator of this.data) {
        color.push(iterator.type ? "#F96868" : "#68B8F9");
      }
      return color;
    },
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");

      this.chart.setOption({
        tooltip: {
          trigger: "item",
          formatter: "{b}",
        },
        color: this.formatColor(),
        series: [
          {
            type: "pie",
            data: this.data,
            animationEasing: "cubicInOut",
            animationDuration: 1000,
          },
        ],
      });
    },
  },
};
</script>
