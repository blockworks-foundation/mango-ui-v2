import PageBodyContainer from '../components/PageBodyContainer'
import TopBar from '../components/TopBar'

export default function AccountHealthCalculator() {
  return (
    <div className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}>
      <TopBar />
      <PageBodyContainer>
        <div className="flex flex-col sm:flex-row pt-8 pb-3 sm:pb-6 md:pt-10">
          <h1 className={`text-th-fgd-1 text-2xl font-semibold`}>
            Account Health Calculator
          </h1>
        </div>
        <div className="p-6 rounded-lg bg-th-bkg-2">Page</div>
      </PageBodyContainer>
    </div>
  )
}
