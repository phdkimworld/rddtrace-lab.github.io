// 입력 PCM(모노)을 약 100ms 단위로 모아 메인 스레드로 보낸다. 리샘플은 메인 스레드에서 한다.
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.size = Math.round(sampleRate / 10);
    this.buf = new Float32Array(this.size);
    this.len = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) {
      let i = 0;
      while (i < ch.length) {
        const n = Math.min(ch.length - i, this.size - this.len);
        this.buf.set(ch.subarray(i, i + n), this.len);
        this.len += n;
        i += n;
        if (this.len === this.size) {
          this.port.postMessage(this.buf, [this.buf.buffer]);
          this.buf = new Float32Array(this.size);
          this.len = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCapture);
