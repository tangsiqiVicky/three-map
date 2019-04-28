<template>
   <div>
     <three-map :param="param1" :id="'container'"></three-map>
   </div>
</template>

<script>
import threeMap from '../components/threeMap'
export default {
  name: 'About',
  data(){
    return {
        param1: {
            id:"canvasBU",
            SVG:{
                SVG1:{
                    depth:60,
                    textSize:30,
                    iconScale:60,
                    SVGurl: require('../assets/svg/1F.svg'),
                    castPoint:false,
                    floor:1
                },
                SVG2:{
                    depth:60,
                    textSize:30,
                    iconScale:60,
                    SVGurl: require('../assets/svg/2F.svg'),
                    castPoint:false,
                    floor:2
                },
                SVG3:{
                    depth:60,
                    textSize:30,
                    iconScale:60,
                    SVGurl: require('../assets/svg/3F.svg'),
                    castPoint:false,
                    floor:3
                }
            },
            clickColor:0xf9f93e,
            upDateAct:false,
            gapValues:100
        }

   }
  },
  components:{threeMap},
  methods:{

  },
  mounted(){

  }
}
</script>
