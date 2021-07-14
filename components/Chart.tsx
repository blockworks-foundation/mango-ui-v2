import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'
import useDimensions from 'react-cool-dimensions'

const Chart = ({ title, xAxis, yAxis, data, labelFormat, type }) => {
  const [mouseData, setMouseData] = useState<string | null>(null)
  const [filterData, setFilterData] = useState(null)
  // @ts-ignore
  const { observe, width, height } = useDimensions()

  const handleMouseMove = (coords) => {
    if (coords.activePayload) {
      setMouseData(coords.activePayload[0].payload)
    }
  }

  const handleMouseLeave = () => {
    setMouseData(null)
  }

  const handleFilterData = (time) => {
    const startFrom = time
      ? new Date(Date.now() - time * 24 * 60 * 60 * 1000).getTime()
      : null

    return startFrom
      ? data.filter((d) => new Date(d.time).getTime() > startFrom)
      : data
  }

  return (
    <div className="h-52 w-full" ref={observe}>
      <div className="flex items-start justify-between w-full">
        <div>
          <div className="pb-0.5 text-xs text-th-fgd-3">{title}</div>
          {mouseData ? (
            <>
              <div className="pb-1 text-xl text-th-fgd-1">
                {labelFormat(mouseData[yAxis])}
              </div>
              <div className="text-xs font-normal text-th-fgd-4">
                {new Date(mouseData[xAxis]).toDateString()}
              </div>
            </>
          ) : data.length > 0 && data[data.length - 1][yAxis] ? (
            <>
              <div className="pb-1 text-xl text-th-fgd-1">
                {labelFormat(data[data.length - 1][yAxis])}
              </div>
              <div className="text-xs font-normal text-th-fgd-4">
                {new Date(data[data.length - 1][xAxis]).toDateString()}
              </div>
            </>
          ) : (
            <>
              <div className="animate-pulse bg-th-bkg-3 h-8 mt-1 rounded w-48" />
              <div className="animate-pulse bg-th-bkg-3 h-4 mt-1 rounded w-24" />
            </>
          )}
        </div>
        <div className="flex h-5">
          <button
            className={`default-transition font-bold mx-3 text-th-fgd-1 text-xs hover:text-th-primary focus:outline-none ${
              filterData === 7 && 'text-th-primary'
            }`}
            onClick={() => setFilterData(7)}
          >
            7D
          </button>
          <button
            className={`default-transition font-bold mx-3 text-th-fgd-1 text-xs hover:text-th-primary focus:outline-none ${
              filterData === 30 && 'text-th-primary'
            }`}
            onClick={() => setFilterData(30)}
          >
            30D
          </button>
          <button
            className={`default-transition font-bold ml-3 text-th-fgd-1 text-xs hover:text-th-primary focus:outline-none ${
              !filterData && 'text-th-primary'
            }`}
            onClick={() => setFilterData(null)}
          >
            ALL
          </button>
        </div>
      </div>
      {width > 0 && type === 'area' ? (
        <AreaChart
          width={width}
          height={height}
          data={data ? handleFilterData(filterData) : null}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <Tooltip
            cursor={{
              strokeOpacity: 0,
            }}
            content={<></>}
          />
          <defs>
            <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF9C24" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#FF9C24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            isAnimationActive={false}
            type="monotone"
            dataKey={yAxis}
            stroke="#FF9C24"
            fill="url(#gradientArea)"
          />
          <XAxis dataKey={xAxis} hide />
          <YAxis dataKey={yAxis} hide />
        </AreaChart>
      ) : null}
      {width > 0 && type === 'bar' ? (
        <BarChart
          width={width}
          height={height}
          data={data ? handleFilterData(filterData) : null}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <Tooltip
            cursor={{
              fill: '#fff',
              opacity: 0.2,
            }}
            content={<></>}
          />
          <defs>
            <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF9C24" stopOpacity={1} />
              <stop offset="100%" stopColor="#FF9C24" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <Bar
            isAnimationActive={false}
            type="monotone"
            dataKey={yAxis}
            fill="url(#gradientBar)"
          />
          <XAxis dataKey={xAxis} hide />
          <YAxis dataKey={yAxis} hide />
        </BarChart>
      ) : null}
    </div>
  )
}

export default Chart
