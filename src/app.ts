import { KLineChartPro, Datafeed } from '@klinecharts/pro'

/**
 * 本地股票数据源类
 * 连接到本地Flask API获取K线数据
 */
class LocalDatafeed implements Datafeed {
  private baseUrl = 'http://localhost:5000/api'

  /**
   * 搜索股票代码
   */
  async searchSymbols(search: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/symbols`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // 过滤包含搜索关键词的股票代码
        const filtered = data.data.filter((symbol: string) => 
          symbol.toLowerCase().includes(search.toLowerCase())
        )
        
        return filtered.map((symbol: string) => ({
          exchange: 'US',
          market: 'stocks',
          name: symbol,
          shortName: symbol,
          ticker: symbol,
          priceCurrency: 'usd',
          type: 'stock'
        }))
      }
      return []
    } catch (error) {
      console.error('搜索股票代码失败:', error)
      return []
    }
  }

  /**
   * 获取K线数据
   * 根据period参数动态设置时间间隔
   */
  async getHistoryKLineData(symbol: any, period: any, from: number, to: number): Promise<any[]> {
    try {
      const startDate = new Date(from).toISOString().split('T')[0]
      const endDate = new Date(to).toISOString().split('T')[0]
      
      // 根据period动态设置interval
      let interval = period.text
      //console.log(period)    
      
      const params = new URLSearchParams({
        symbol: symbol.ticker,
        interval: interval,
        start_date: startDate,
        end_date: endDate,
        adjusted: 'true'
      })
      
      const response = await fetch(`${this.baseUrl}/kline?${params}`)
      const data = await response.json()
      
      if (data.success && data.data && data.data.kline) {
        return data.data.kline.map((item: any[]) => ({
          timestamp: item[0],
          open: item[1],
          high: item[2],
          low: item[3],
          close: item[4],
          volume: item[5]
        }))
      }
      return []
    } catch (error) {
      console.error('获取K线数据失败:', error)
      return []
    }
  }

  /**
   * 订阅实时数据
   * 由于使用本地API，这里返回空的订阅函数
   */
  subscribe(symbol: any, period: any, callback: (data: any) => void): () => void {
    // 本地API不支持实时数据推送，返回空的取消订阅函数
    console.log('订阅实时数据:', symbol, period)
    return () => {
      console.log('取消订阅:', symbol)
    }
  }

  /**
   * 取消订阅实时数据
   * 由于使用本地API，这里只是打印日志
   */
  unsubscribe(symbol: any, period: any): void {
    console.log('取消订阅实时数据:', symbol, period)
  }

  /**
   * 获取支持的时间周期
   */
  getSupportedResolutions(): string[] {
    return ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M']
  }

  /**
   * 获取服务器时间
   */
  getServerTime(): Promise<number> {
    return Promise.resolve(Date.now())
  }
}

export default function setupApp (root: HTMLDivElement) {
  let locale = 'zh-CN'
  if (window.location.hash.endsWith('#en-US')) {
    locale = 'en-US'
  }
  root.innerHTML = `
    <div class="github"></div>
    <p class="announcement-bar">
      <font size=5>
      美股查询系统
      </font>
    </p>
    <div id="container">
    </div>
  `
  const options = {
    container: 'container',
    locale,
    watermark: `<svg
        class="logo"
        viewBox="0 0 160 160">
        <path d="M95.1576,6.27848L153.722,64.8424Q156.803,67.9238,158.43,71.9362Q160,75.8078,160,80Q160,84.1922,158.43,88.0638Q156.803,92.0762,153.722,95.1576L95.1576,153.722Q92.0762,156.803,88.0638,158.43Q84.1922,160,80,160Q75.8078,160,71.9362,158.43Q67.9238,156.803,64.8424,153.722L6.27848,95.1576Q3.19708,92.0762,1.56999,88.0638Q0,84.1922,0,80Q0,75.8078,1.56999,71.9362Q3.19707,67.9238,6.27848,64.8424L64.8424,6.27848Q67.9238,3.19707,71.9362,1.56999Q75.8078,0,80,0Q84.1922,0,88.0638,1.56999Q92.0762,3.19707,95.1576,6.27848ZM87.9397,13.4964Q86.322,11.8787,84.2279,11.0295Q82.2013,10.2077,80,10.2077Q77.7987,10.2077,75.7721,11.0295Q73.678,11.8787,72.0603,13.4964L54.5534,31.0033L105.447,31.0033L87.9397,13.4964ZM107.561,118.789Q109.848,118.789,111.93,117.909Q113.944,117.057,115.5,115.5Q117.057,113.944,117.909,111.93Q118.789,109.848,118.789,107.561L118.789,52.4393Q118.789,50.1516,117.909,48.0703Q117.057,46.0562,115.5,44.4996Q113.944,42.9431,111.93,42.0912Q109.848,41.2109,107.561,41.2109L52.4393,41.2109Q50.1515,41.2109,48.0703,42.0912Q46.0562,42.9431,44.4996,44.4996Q42.9431,46.0562,42.0912,48.0703Q41.2109,50.1515,41.2109,52.4393L41.2109,107.561Q41.2109,109.848,42.0912,111.93Q42.9431,113.944,44.4996,115.5Q46.0562,117.057,48.0703,117.909Q50.1516,118.789,52.4393,118.789L107.561,118.789ZM13.4964,72.0603L31.0033,54.5534L31.0033,105.447L13.4964,87.9397Q11.8787,86.322,11.0295,84.2278Q10.2077,82.2013,10.2077,80Q10.2077,77.7987,11.0295,75.7721Q11.8787,73.678,13.4964,72.0603ZM146.504,87.9397L128.997,105.447L128.997,54.5534L146.504,72.0603Q148.121,73.678,148.971,75.7721Q149.792,77.7987,149.792,80Q149.792,82.2013,148.971,84.2279Q148.121,86.322,146.504,87.9397ZM72.0603,146.504L54.5534,128.997L105.447,128.997L87.9397,146.504Q86.322,148.121,84.2278,148.971Q82.2012,149.792,80,149.792Q77.7987,149.792,75.7721,148.971Q73.678,148.121,72.0603,146.504Z" fill-rule="evenodd" fill-opacity="1"/>
        <path d="M64.16208911132813,62.68834972381592C63.348189111328125,62.68834972381592,62.68838911132812,63.27273572381592,62.68838911132812,63.993609723815915L62.68838911132812,71.82518972381592L55.319959111328124,71.82518972381592C53.69216911132813,71.82518972381592,52.372589111328125,72.99394972381592,52.372589111328125,74.43574972381592L52.372589111328125,96.62514972381592C52.372589111328125,98.06694972381592,53.69216911132813,99.23574972381593,55.319959111328124,99.23574972381593L62.68838911132812,99.23574972381593L62.68838911132812,107.06724972381592C62.68838911132812,107.78814972381592,63.348189111328125,108.37254972381592,64.16208911132813,108.37254972381592C64.97598911132812,108.37254972381592,65.63578911132812,107.78814972381592,65.63578911132812,107.06724972381592L65.63578911132812,99.23574972381593L73.00418911132812,99.23574972381593C74.63198911132812,99.23574972381593,75.95148911132813,98.06694972381592,75.95148911132813,96.62514972381592L75.95148911132813,74.43574972381592C75.95148911132813,72.99394972381592,74.63198911132812,71.82518972381592,73.00418911132812,71.82518972381592L65.63578911132812,71.82518972381592L65.63578911132812,63.993609723815915C65.63578911132812,63.27273572381592,64.97598911132812,62.68834972381592,64.16208911132813,62.68834972381592Z" fill-rule="evenodd" fill-opacity="1"/>
        <path d="M96.58314395141602,52.37255859375C95.76924395141602,52.37255859375,95.10944395141601,52.95694459375,95.10944395141601,53.67781859375L95.10944395141601,61.50939859375L87.74101395141602,61.50939859375C86.11322395141602,61.50939859375,84.79364395141602,62.67815859375,84.79364395141602,64.11995859375L84.79364395141602,86.30935859375C84.79364395141602,87.75115859375,86.11322395141602,88.91995859375001,87.74101395141602,88.91995859375001L95.10944395141601,88.91995859375001L95.10944395141601,96.75145859375C95.10944395141601,97.47235859375,95.76924395141602,98.05675859375,96.58314395141602,98.05675859375C97.39704395141601,98.05675859375,98.05684395141601,97.47235859375,98.05684395141601,96.75145859375L98.05684395141601,88.91995859375001L105.42524395141601,88.91995859375001C107.05304395141602,88.91995859375001,108.37254395141602,87.75115859375,108.37254395141602,86.30935859375L108.37254395141602,64.11995859375C108.37254395141602,62.67815859375,107.05304395141602,61.50939859375,105.42524395141601,61.50939859375L98.05684395141601,61.50939859375L98.05684395141601,53.67781859375C98.05684395141601,52.95694459375,97.39704395141601,52.37255859375,96.58314395141602,52.37255859375Z" fill-rule="evenodd" fill-opacity="1"/>
      </svg>`,
    symbol: {
      exchange: 'XNYS',
      market: 'stocks',
      name: 'Alibaba Group Holding Limited American Depositary Shares, each represents eight Ordinary Shares',
      shortName: 'BABA',
      ticker: 'BABA',
      priceCurrency: 'usd',
      type: 'ADRC',
      logo: 'data:image/png;base64,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'
    },
    period: { multiplier: 1, timespan: 'day', text: '1d' },
    periods: [
      { multiplier: 1, timespan: 'minute', text: '1m' },
      { multiplier: 3, timespan: 'minute', text: '3m' },
      { multiplier: 5, timespan: 'minute', text: '5m' },
      { multiplier: 15, timespan: 'minute', text: '15m' },
      { multiplier: 30, timespan: 'minute', text: '30m' },
      { multiplier: 1, timespan: 'hour', text: '1h' },
      { multiplier: 1, timespan: 'day', text: '1d' },
      { multiplier: 1, timespan: 'week', text: '1w' },
      { multiplier: 1, timespan: 'month', text: '1M' }   
    ],  
    subIndicators: ['VOL', 'MACD'],
    datafeed: new LocalDatafeed()
  }
  new KLineChartPro(options)
}

