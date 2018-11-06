export default {
  methods: {
    parseReq (req) {
      if (this.$route.meta.protected) {
        return this.$cookies.get('session') + ';' + this.encrypt(req + ';WEB', this.$cookies.get('encKey')) + ';'
      } else {
        return '1;' + req + ';WEB;'
      }
    },
    parseRes (res) {
      let datalist = res.split(';')
      if (Array.isArray(datalist)) {
        if (datalist[0] === 'false') {
          throw Error(datalist[1])
        } else if (this.$route.meta.protected) {
          return this.decrypt(datalist[1], this.$cookies.get('encKey')).split(';')
        } else {
          return datalist
        }
      } else {
        throw Error('Not an array in response')
      }
    },
    isGPIOnumber (numbers) {
      for (var i = 0; i < numbers.length; i++) {
        if (!/^(2|3|4|17|27|22|10|9|11|5|6|13|19|26|14|15|18|23|24|25|8|7|12|16|20|21)$/g.test(numbers[i])) {
          return numbers[i]
        }
      }
      return -1
    },
    // getAllUsedPins (type, id) {
    //   return this.$http.post('/', this.parseReq('AllUsedPins_GPIO;' + type + ';' + id), { headers: {
    //     'Content-type': 'raw'
    //   }})
    // },
    stateButton (state, reverse) {
      if ((state === 1 && !reverse) || (state === 0 && reverse)) {
        return 'btn-success'
      } else if ((state === 0 && !reverse) || (state === 1 && reverse)) {
        return 'btn-code'
      } else {
        return 'btn-warning'
      }
    },
    outState (state) {
      state = parseInt(state)
      if (state === 0) {
        return 'OFF'
      } else if (state === 1) {
        return 'ON'
      } else {
        return 'OPPOSITE'
      }
    },
    pwmState (state, dc, fr) {
      let stateName = this.outState(state)
      if (!isNaN(dc) && dc !== '') {
        stateName += '/' + dc + '%'
      }
      if (!isNaN(fr) && fr !== '') {
        stateName += '/' + fr + 'Hz'
      }
      return stateName
    },
    doPost (req) {
      this.$Progress.start()
      this.loading = true
      return this.$http.post('/', this.parseReq(req), { headers: {
        'Content-type': 'raw'
      } }).then(r => {
        this.$Progress.finish()
        return this.parseRes(r.data)
      }).catch((err) => {
        this.$Progress.fail()
        throw Error(err.message)
      }).then((r) => {
        this.loading = false
        return r
      })
    },
    doQPost (req) {
      return this.$http.post('/', this.parseReq(req), { headers: {
        'Content-type': 'raw'
      } }).then(r => {
        return this.parseRes(r.data)
      })
    },
    doPosts (reqs) {
      this.$Progress.start()
      this.loading = true
      return Promise.all(reqs).catch(err => {
        this.$Progress.fail()
        return err
      }).then(() => {
        this.$Progress.finish()
        this.loading = false
      })
    }
  },
  data () {
    return {
      loading: false
    }
  }
}
