// v1.1 Faza E: ProfileMainView.jsx dan o'zgarishsiz ko'chirildi (klasslar, stil va DOM bir xil).
import {
  CheckCircle2, Globe, Camera, Edit3, Plus, Zap, Truck, UserCheck, Car
} from 'lucide-react';
import { getModelPresetImage } from '../../services/vehicleImageService';
import VehiclePhoto from '../VehiclePhoto';
import { photoForIdentityChange } from '../../utils/vehicleUtils';
import { MASTER_VEHICLE_DATABASE } from '../../data/japaneseVehiclesMaster';
import { ALL_GLOBAL_BRANDS, InlineCustomSelect } from './profileShared';
import { pickText } from '../../utils/localize';

// Inglizcha tartib qo'shimchasi: 2 → 2nd, 3 → 3rd, 4 → 4th, 11 → 11th
const enOrdinal = (n) => {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th'}`;
};

export default function VehicleCard(ctx) {
  const { JDM_HIRAGANA, dynamicModels, editVehicleData, fleetTabsRef, getProfileLangText, getVehiclePresetDimensions, handleAddNewVehicle, handleCardTouchEnd, handleCardTouchStart, handleDeleteVehicle, handleSaveVehicle, handleSelectActiveVehicleSmooth, handleVehiclePhotoUpload, i18n, isCardFading, isEditingVehicle, myVehicle, myVehicles, renderDriverMarkBadge, renderJDMPlateBox, setEditVehicleData, setIsEditingVehicle, setIsVehiclePickerOpen, setVehicleClearConfirm, t, vehicleFileInputRef } = ctx;
  const tx = (map) => pickText(i18n?.language, map);
  const addVehicleLabel = tx({ ja: '車両を追加', en: 'Add Vehicle', uz: "Avtomobil qo'shish", ru: 'Добавить автомобиль', zh: '添加车辆', vi: 'Thêm xe', ne: 'सवारी थप्नुहोस्' });
  const modelInputPlaceholder = tx({ ja: 'モデル名を入力...', en: 'Enter model name...', uz: 'Model nomini kiriting...', ru: 'Введите название модели...', zh: '请输入车型名称...', vi: 'Nhập tên mẫu xe...', ne: 'मोडेलको नाम प्रविष्ट गर्नुहोस्...' });
  return (
    <div className="profile-subcard glass squircle" style={{ marginBottom: '4px' }}>
      <div className="profile-subcard-header" style={{ justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div className="profile-subcard-icon-wrap" style={{ background: 'rgba(52, 199, 89, 0.12)', color: '#34C759' }}>
            <Car size={18} />
          </div>
          <span className="profile-subcard-title">{getProfileLangText('myVehicleTitle')}</span>
        </div>
        {!isEditingVehicle && (
          <button 
            type="button"
            className="profile-btn-interactive"
            style={{
              background: 'linear-gradient(135deg, rgba(48, 209, 88, 0.15) 0%, rgba(0, 132, 255, 0.15) 100%)',
              border: '1px solid rgba(48, 209, 88, 0.35)',
              color: 'var(--text-main)',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(48, 209, 88, 0.12)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
            onClick={() => {
              setEditVehicleData(myVehicle ? { ...myVehicle } : {
                id: 'v_' + Date.now(),
                type: 'car',
                make: 'Toyota',
                model: 'Harrier',
                bodyStyle: 'suv',
                trim: 'Z',
                year: '2024',
                color: '#5E5CE6',
                platePrefecture: '練馬',
                plateClass: '300',
                plateHira: 'あ',
                plateNumber: '12-34',
                isCommercial: false,
                plateType: 'private',
                driverMark: 'none',
                height: '1.69',
                width: '1.85',
                length: '4.74',
                weight: '1.70',
                axleLoad: '0.85',
                minTurnRadius: '5.3'
              });
              setIsEditingVehicle(true);
            }}
            title={tx({ ja: '車両情報を編集', en: 'Edit Vehicle Info', uz: 'Avtomobil maʼlumotlarini tahrirlash', ru: 'Редактировать данные автомобиля', zh: '编辑车辆信息', vi: 'Chỉnh sửa thông tin xe', ne: 'सवारीको जानकारी सम्पादन गर्नुहोस्' })}
          >
            <Edit3 size={13} strokeWidth={2.5} color="#30D158" />
            <span style={{ letterSpacing: '-0.2px' }}>{getProfileLangText('editVehicle')}</span>
          </button>
        )}
      </div>

      <div className="resume-body">
        {!isEditingVehicle ? (
          !myVehicle ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '24px 16px',
              background: 'var(--card-bg, rgba(255, 255, 255, 0.03))',
              border: '1.5px dashed var(--glass-border)',
              borderRadius: '16px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(0, 132, 255, 0.12)',
                border: '1px solid rgba(0, 132, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0084FF'
              }}>
                <UserCheck size={28} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                  {tx({
                    ja: '自家用車なし (徒歩 / 会社車両利用)',
                    en: 'No Personal Vehicle (Pedestrian / Company Transport)',
                    uz: 'Shaxsiy Avtomobil Yoʻq (Piyoda / Kompaniya Transporti)',
                    ru: 'Нет личного автомобиля (пешком / транспорт компании)',
                    zh: '无私家车（步行 / 使用公司车辆）',
                    vi: 'Không có xe cá nhân (Đi bộ / Xe công ty)',
                    ne: 'व्यक्तिगत सवारी छैन (पैदल / कम्पनीको सवारी)'
                  })}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: '1.4' }}>
                  {tx({
                    ja: '登録された車両はありません。仕事では会社車両や公共交通機関を利用します。',
                    en: 'No personal vehicle registered. You use company transport or public transit.',
                    uz: 'Sizda shaxsiy transport roʻyxatdan oʻtkazilmagan. Ishga kompaniya transportida yoki jamoat transportida qatnaysiz.',
                    ru: 'Личный автомобиль не зарегистрирован. На работу вы ездите на транспорте компании или общественном транспорте.',
                    zh: '未登记私家车。工作中使用公司车辆或公共交通。',
                    vi: 'Chưa đăng ký xe cá nhân. Bạn đi làm bằng xe công ty hoặc phương tiện công cộng.',
                    ne: 'कुनै व्यक्तिगत सवारी दर्ता गरिएको छैन। तपाईं काममा कम्पनीको सवारी वा सार्वजनिक यातायात प्रयोग गर्नुहुन्छ।'
                  })}
                </span>
              </div>

              <button
                onClick={handleAddNewVehicle}
                className="profile-btn-interactive"
                style={{
                  background: 'linear-gradient(135deg, #0084FF 0%, #30D158 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12.5px',
                  fontWeight: 'bold',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(0, 132, 255, 0.3)',
                  marginTop: '4px'
                }}
              >
                <Plus size={14} /> {tx({ ja: '車両を登録・追加する', en: 'Add Vehicle', uz: 'Avtomobil Qoʻshish', ru: 'Добавить автомобиль', zh: '登记并添加车辆', vi: 'Đăng ký / Thêm xe', ne: 'सवारी दर्ता / थप्नुहोस्' })}
              </button>
            </div>
          ) : (
            <div 
              onTouchStart={handleCardTouchStart}
              onTouchEnd={handleCardTouchEnd}
              onMouseDown={handleCardTouchStart}
              onMouseUp={handleCardTouchEnd}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px', 
                width: '100%',
                opacity: isCardFading ? 0.45 : 1,
                filter: isCardFading ? 'blur(3px)' : 'blur(0px)',
                transform: isCardFading ? 'translateY(6px) scale(0.985)' : 'translateY(0) scale(1)',
                transition: 'opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), filter 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: myVehicles.length > 1 ? 'grab' : 'default',
                userSelect: 'none',
                willChange: 'opacity, filter, transform'
              }}
            >
              {/* Visual Layout: 3D Vehicle Render Left, Japanese License Plate Right */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                width: '100%',
                alignItems: 'center'
              }}>
                {/* Vehicle Graphic / Real Photo Display */}
                <div className="vehicle-display-box squircle" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--card-bg, rgba(255, 255, 255, 0.03))',
                  border: '1px solid var(--glass-border)',
                  padding: myVehicle.photoUrl ? '0' : '12px',
                  height: '110px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '16px'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)',
                    pointerEvents: 'none',
                    zIndex: 2
                  }}></div>
                  {/* v1.1: photoUrl → lokal preset → gradient karta (Unsplash'dagi tasodifiy sedan o'rniga) */}
                  <VehiclePhoto
                    key={`${myVehicle.id}|${myVehicle.photoUrl || ''}|${myVehicle.model || ''}`}
                    vehicle={myVehicle}
                    height={myVehicle.photoUrl ? 110 : 86}
                  />
                </div>

                {/* JDM License Plate Display */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  {renderJDMPlateBox(myVehicle, false)}
                  {myVehicle.driverMark && myVehicle.driverMark !== 'none' && (
                    <div style={{ marginTop: '14px' }}>
                      {renderDriverMarkBadge(myVehicle.driverMark)}
                    </div>
                  )}
                </div>
              </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div className="resume-field">
                <span className="field-label">{getProfileLangText('vehicleTypeLabel')}</span>
                <span className="field-value" style={{ textTransform: 'capitalize' }}>
                  {myVehicle.type === 'car' ? getProfileLangText('type_car') :
                   myVehicle.type === 'moto' ? getProfileLangText('type_moto') :
                   myVehicle.type === 'velo' ? getProfileLangText('type_velo') :
                   myVehicle.type === 'kei_truck' ? getProfileLangText('type_kei_truck') :
                   myVehicle.type === 'truck_2t' ? getProfileLangText('type_truck_2t') :
                   myVehicle.type === 'truck_3t' ? getProfileLangText('type_truck_3t') :
                   myVehicle.type === 'truck_4t' ? getProfileLangText('type_truck_4t') :
                   myVehicle.type === 'truck_10t' ? getProfileLangText('type_truck_10t') :
                   myVehicle.type === 'trailer' ? getProfileLangText('type_trailer') :
                   myVehicle.type === 'tanker' ? getProfileLangText('type_tanker') :
                   myVehicle.type === 'bus' ? getProfileLangText('type_bus') : myVehicle.type}
                </span>
              </div>

              <div className="resume-field">
                <span className="field-label">{getProfileLangText('vehicleModelLabel')}</span>
                <span className="field-value" style={{ fontWeight: 'bold' }}>
                  {myVehicle.make} {myVehicle.model} {myVehicle.trim && `(${myVehicle.trim})`}
                </span>
              </div>

              <div className="resume-field">
                <span className="field-label">{getProfileLangText('vehicleBodyStyleLabel')}</span>
                <span className="field-value" style={{ textTransform: 'capitalize' }}>
                  {myVehicle.bodyStyle === 'sedan' ? getProfileLangText('body_sedan') :
                   myVehicle.bodyStyle === 'hatchback' ? getProfileLangText('body_hatchback') :
                   myVehicle.bodyStyle === 'suv' ? getProfileLangText('body_suv') :
                   myVehicle.bodyStyle === 'minivan' ? getProfileLangText('body_minivan') :
                   myVehicle.bodyStyle === 'scooter' ? getProfileLangText('body_scooter') :
                   myVehicle.bodyStyle === 'sportbike' ? getProfileLangText('body_sportbike') :
                   myVehicle.bodyStyle === 'flatbed' ? getProfileLangText('body_flatbed') :
                   myVehicle.bodyStyle === 'box_truck' ? getProfileLangText('body_box_truck') :
                   myVehicle.bodyStyle === 'wing_body' ? getProfileLangText('body_wing_body') :
                   myVehicle.bodyStyle === 'dump_truck' ? getProfileLangText('body_dump_truck') :
                   myVehicle.bodyStyle === 'trailer_container' ? getProfileLangText('body_trailer_container') :
                   myVehicle.bodyStyle || getProfileLangText('body_standard')}
                </span>
              </div>

              <div className="resume-field">
                <span className="field-label">{getProfileLangText('vehicleYearLabel')}</span>
                <span className="field-value">{myVehicle.year || '-'}</span>
              </div>

              <div className="resume-field" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '4px' }}>
                <span className="field-label" style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  📐 <span>{getProfileLangText('vehicleDimensionsLabel')}</span>
                  <span style={{ 
                    fontSize: '9.5px', 
                    background: 'linear-gradient(135deg, #30D158 0%, #0084FF 100%)', 
                    color: 'white', 
                    padding: '3px 8px', 
                    borderRadius: '6px', 
                    fontWeight: '800', 
                    marginLeft: 'auto', 
                    letterSpacing: '0.4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(48, 209, 88, 0.25)'
                  }}>
                    <CheckCircle2 size={11} strokeWidth={2.5} />
                    <span>{tx({ ja: '自動設定済み', en: 'AUTO-CONFIGURED', uz: 'AVTO-SOZLANGAN', ru: 'НАСТРОЕНО АВТОМАТИЧЕСКИ', zh: '已自动设置', vi: 'ĐÃ TỰ ĐỘNG CÀI ĐẶT', ne: 'स्वचालित रूपमा सेट गरिएको' })}</span>
                  </span>
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
                  <div style={{ background: 'var(--card-bg, rgba(255, 255, 255, 0.04))', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '9.5px', color: '#0A84FF', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      📏 {getProfileLangText('heightLabel')}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{myVehicle.height || '-'} m</span>
                  </div>

                  <div style={{ background: 'var(--card-bg, rgba(255, 255, 255, 0.04))', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '9.5px', color: '#30D158', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      ↔️ {getProfileLangText('widthLabel')}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{myVehicle.width || '-'} m</span>
                  </div>

                  <div style={{ background: 'var(--card-bg, rgba(255, 255, 255, 0.04))', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '9.5px', color: '#FF9500', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      🏎️ {getProfileLangText('lengthLabel')}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{myVehicle.length || '-'} m</span>
                  </div>

                  <div style={{ background: 'var(--card-bg, rgba(255, 255, 255, 0.04))', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '9.5px', color: '#BF5AF2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      ⚖️ {getProfileLangText('weightLabel')}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{myVehicle.weight || '-'} t</span>
                  </div>

                  <div style={{ background: 'var(--card-bg, rgba(255, 255, 255, 0.04))', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '9.5px', color: '#5E5CE6', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      🏋️ {getProfileLangText('axleLoadLabel')}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{myVehicle.axleLoad || '-'} t</span>
                  </div>

                  <div style={{ background: 'var(--card-bg, rgba(255, 255, 255, 0.04))', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: '9.5px', color: '#30B0C7', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      🔄 {getProfileLangText('minTurnRadiusLabel')}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{myVehicle.minTurnRadius || '-'} m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Vehicle Swipeable Tab Bar */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(0, 132, 255, 0.12)',
                    border: '1px solid rgba(0, 132, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Car size={13} strokeWidth={2.2} color="#0084FF" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '850', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
                    {tx({ ja: '登録車両タブ', en: 'Vehicle Tabs', uz: 'Garaj Tablari', ru: 'Мои автомобили', zh: '已登记车辆', vi: 'Xe đã đăng ký', ne: 'दर्ता गरिएका सवारीहरू' })}
                  </span>
                  <span style={{ fontSize: '10px', background: 'rgba(0, 132, 255, 0.15)', color: '#0084FF', padding: '1px 8px', borderRadius: '10px', fontWeight: '800' }}>
                    {myVehicles.length}
                  </span>
                </div>

                {/* Visual Swipe Hint Badge & Add Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {myVehicles.length > 1 && (
                    <span style={{
                      fontSize: '9.5px',
                      color: '#0084FF',
                      background: 'rgba(0, 132, 255, 0.1)',
                      border: '1px solid rgba(0, 132, 255, 0.25)',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      👈 {tx({ ja: '横スワイプ', en: 'Swipe ↔️', uz: 'Surish ↔️', ru: 'Листайте ↔️', zh: '左右滑动 ↔️', vi: 'Vuốt ↔️', ne: 'स्वाइप गर्नुहोस् ↔️' })}
                    </span>
                  )}

                  <button 
                    onClick={handleAddNewVehicle}
                    className="profile-btn-interactive"
                    style={{
                      background: 'linear-gradient(135deg, #0084FF 0%, #30D158 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 4px 12px rgba(0, 132, 255, 0.3)'
                    }}
                  >
                    <Plus size={13} /> {tx({ ja: '新規追加', en: 'Add New', uz: 'Yangi Qoʻshish', ru: 'Добавить', zh: '新增', vi: 'Thêm mới', ne: 'नयाँ थप्नुहोस्' })}
                  </button>
                </div>
              </div>
              
              {/* Horizontal Swipeable Text Pill Tabs with ref and smooth scroll */}
              <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
                <div 
                  ref={fleetTabsRef}
                  style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    overflowX: 'auto', 
                    paddingBottom: '8px', 
                    paddingTop: '4px',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none'
                  }}
                >
                  {myVehicles.map((veh, idx) => {
                    const isActive = myVehicle && String(myVehicle.id) === String(veh.id);
                    return (
                      <div
                        key={veh.id}
                        data-veh-id={String(veh.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          scrollSnapAlign: 'start',
                          flexShrink: myVehicles.length === 1 ? 1 : 0,
                          flex: myVehicles.length === 1 ? '1 1 0px' : 'none',
                          minWidth: 0
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectActiveVehicleSmooth(veh)}
                          className="fleet-tab-pill profile-btn-interactive"
                          style={{
                            width: myVehicles.length === 1 ? '100%' : 'auto',
                            justifyContent: 'center',
                            padding: '8px 10px',
                            borderRadius: '12px',
                            background: isActive 
                              ? 'linear-gradient(135deg, #30D158 0%, #0084FF 100%)' 
                              : 'var(--card-bg, rgba(255, 255, 255, 0.05))',
                            border: isActive ? 'none' : '1.5px solid var(--glass-border)',
                            color: isActive ? '#000' : 'var(--text-main)',
                            fontWeight: 'bold',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            boxShadow: isActive ? '0 4px 14px rgba(48, 209, 88, 0.35)' : '0 2px 6px rgba(0,0,0,0.02)',
                            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          <span style={{ fontSize: '13px', flexShrink: 0 }}>
                            {veh.type === 'truck_10t' || veh.type === 'truck_4t' || veh.type === 'truck_2t' ? '🚚' : veh.type === 'moto' ? '🏍️' : '🚘'}
                          </span>
                          <span style={{ fontSize: '11.5px', fontWeight: '800', letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1 }}>
                            {veh.make} {veh.model}
                          </span>
                          {isActive ? (
                            <span style={{ fontSize: '8.5px', fontWeight: '800', background: 'rgba(0, 0, 0, 0.85)', color: '#30D158', padding: '1px 4px', borderRadius: '4px', flexShrink: 0 }}>
                              ⚡ {tx({ ja: '選択中', en: 'ACTIVE', uz: 'FAOL', ru: 'АКТИВНЫЙ', zh: '使用中', vi: 'ĐANG CHỌN', ne: 'सक्रिय' })}
                            </span>
                          ) : (
                            <span style={{ fontSize: '8.5px', opacity: 0.7, background: 'rgba(0,0,0,0.15)', padding: '1px 4px', borderRadius: '4px', fontWeight: '800', flexShrink: 0 }}>
                              #{idx + 1}
                            </span>
                          )}
                          {/* Visible Delete Button on EVERY vehicle tab */}
                          <span
                            id={`vehicle-delete-${veh.id}`}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVehicle(veh.id, e);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: isActive ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 69, 58, 0.18)',
                              color: isActive ? '#fff' : '#FF453A',
                              fontSize: '9.5px',
                              fontWeight: 'bold',
                              marginLeft: '3px',
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'all 0.2s ease',
                              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.2)' : 'none'
                            }}
                            title={tx({ ja: '車両を削除', en: 'Delete Vehicle', uz: "Avtomobilni o'chirish", ru: 'Удалить автомобиль', zh: '删除车辆', vi: 'Xóa xe', ne: 'सवारी हटाउनुहोस्' })}
                          >
                            ✕
                          </span>
                        </button>
                      </div>
                    );
                  })}

                  {/* Add Next Vehicle Invitation Pill Tab */}
                  <button
                    type="button"
                    onClick={handleAddNewVehicle}
                    className="fleet-tab-pill fleet-add-invitation-tab profile-btn-interactive"
                    style={{
                      flex: myVehicles.length === 1 ? '1 1 0px' : 'none',
                      minWidth: 0,
                      justifyContent: 'center',
                      padding: '8px 8px',
                      borderRadius: '12px',
                      background: 'rgba(0, 132, 255, 0.08)',
                      border: '1.5px dashed rgba(0, 132, 255, 0.4)',
                      color: '#0084FF',
                      fontWeight: 'bold',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      flexShrink: myVehicles.length === 1 ? 1 : 0,
                      scrollSnapAlign: 'start',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    title={addVehicleLabel}
                  >
                    <Plus size={12} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '11.5px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1 }}>
                      {tx({
                        ja: `${myVehicles.length + 1}台目を追加`,
                        en: `Add ${enOrdinal(myVehicles.length + 1)} Car`,
                        uz: `${myVehicles.length + 1}-mashina qo'shish`,
                        ru: `Добавить ${myVehicles.length + 1}-й автомобиль`,
                        zh: `添加第 ${myVehicles.length + 1} 辆车`,
                        vi: `Thêm xe thứ ${myVehicles.length + 1}`,
                        ne: `${myVehicles.length + 1}औं सवारी थप्नुहोस्`
                      })}
                    </span>
                  </button>
                </div>

                {/* Ultra-Premium High-Contrast Pagination Indicator Bar */}
                {myVehicles.length > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '7px', 
                    padding: '6px 14px',
                    background: 'var(--card-bg, rgba(0, 0, 0, 0.04))',
                    borderRadius: '20px',
                    width: 'fit-content',
                    margin: '8px auto 0 auto',
                    border: '1.5px solid var(--glass-border)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    {myVehicles.map((v, idx) => {
                      const isSelected = myVehicle && String(myVehicle.id) === String(v.id);
                      return (
                        <button
                          key={'dot_' + v.id}
                          type="button"
                          onClick={() => handleSelectActiveVehicleSmooth(v)}
                          className="fleet-dot-pill profile-btn-interactive"
                          style={{
                            padding: 0,
                            border: isSelected ? 'none' : '1.5px solid rgba(0, 132, 255, 0.5)',
                            width: isSelected ? '26px' : '10px',
                            height: '10px',
                            borderRadius: '6px',
                            background: isSelected 
                              ? 'linear-gradient(135deg, #30D158 0%, #0084FF 100%)' 
                              : 'rgba(0, 132, 255, 0.25)',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 0 10px rgba(48, 209, 88, 0.6), 0 2px 6px rgba(0, 132, 255, 0.35)' : 'none',
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            outline: 'none'
                          }}
                          title={`${v.make} ${v.model} (${idx + 1}/${myVehicles.length})`}
                        />
                      );
                    })}
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', marginLeft: '4px', letterSpacing: '0.3px' }}>
                      {Math.max(1, myVehicles.findIndex(v => String(v.id) === String(myVehicle?.id)) + 1)} / {myVehicles.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
            {/* Hidden Photo File Input */}
            <input 
              type="file" 
              ref={vehicleFileInputRef} 
              accept="image/*" 
              onChange={handleVehiclePhotoUpload} 
              style={{ display: 'none' }} 
            />

            {/* Realtime Live Preview with dynamic paint color, Real Photo and JDM Plate Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                gap: '12px',
                width: '100%',
                alignItems: 'center'
              }}>
                {/* Real Photo Preview */}
                <div className="vehicle-display-box squircle" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--card-bg, rgba(255, 255, 255, 0.03))',
                  border: '1.5px dashed var(--primary)',
                  padding: editVehicleData.photoUrl ? '0' : '12px',
                  height: '110px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '14px'
                }}>
                  <VehiclePhoto
                    key={`${editVehicleData.id || 'new'}|${editVehicleData.photoUrl || ''}|${editVehicleData.model || ''}`}
                    vehicle={editVehicleData}
                    height={editVehicleData.photoUrl ? 110 : 86}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    fontSize: '8px',
                    background: editVehicleData.photoUrl ? '#30D158' : '#0084FF',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px'
                  }}>
                    {editVehicleData.photoUrl ? '📸 REAL HD PHOTO' : '⚡ HD RESOLVING'}
                  </span>
                </div>

                {/* Live Plate Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  {renderJDMPlateBox(editVehicleData, true)}
                  {editVehicleData.driverMark && editVehicleData.driverMark !== 'none' && (
                    <div style={{ transform: 'scale(0.9)', marginTop: '4px' }}>
                      {renderDriverMarkBadge(editVehicleData.driverMark)}
                    </div>
                  )}
                </div>
              </div>

              {/* Real Photo Action Toolbar (Upload + All Japanese Fleet Modal + HD Presets + Reset) */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', paddingTop: '2px' }}>
                <button 
                  type="button"
                  onClick={() => setIsVehiclePickerOpen(true)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(255, 149, 0, 0.2) 0%, rgba(255, 45, 85, 0.2) 100%)',
                    border: '1px solid rgba(255, 149, 0, 0.4)',
                    color: '#FF9500',
                    fontSize: '10.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Globe size={12} />
                  <span>{tx({ ja: '全日本車カタログ', en: 'Japanese Fleet Catalog', uz: 'Barcha Yapon Moshinalari', ru: 'Каталог японских авто', zh: '日本车全车型目录', vi: 'Danh mục xe Nhật Bản', ne: 'जापानी सवारी क्याटलग' })}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => vehicleFileInputRef.current?.click()}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: 'rgba(0, 132, 255, 0.12)',
                    border: '1px solid rgba(0, 132, 255, 0.3)',
                    color: '#0084FF',
                    fontSize: '10.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Camera size={12} />
                  <span>{tx({ ja: '写真アップロード', en: 'Upload Photo', uz: 'Rasm Yuklash', ru: 'Загрузить фото', zh: '上传照片', vi: 'Tải ảnh lên', ne: 'फोटो अपलोड गर्नुहोस्' })}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    // Lokal HD rasm darhol (tarmoqsiz) — Wikipedia natijasi bilan almashtirilmaydi
                    setEditVehicleData(prev => ({ ...prev, make: 'Isuzu', model: 'Giga', type: 'truck_10t', bodyStyle: 'wing_body', photoUrl: getModelPresetImage('Giga'), ...getVehiclePresetDimensions('truck_10t', 'wing_body') }));
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: editVehicleData?.model === 'Giga' ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: editVehicleData?.model === 'Giga' ? '1px solid #30D158' : '1px solid var(--glass-border)',
                    color: editVehicleData?.model === 'Giga' ? '#30D158' : 'var(--text-secondary)',
                    fontSize: '10.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Truck size={12} />
                  <span>HD Isuzu Giga (10t)</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setEditVehicleData(prev => ({ ...prev, make: 'Hino', model: 'Profia', type: 'truck_10t', bodyStyle: 'wing_body', photoUrl: getModelPresetImage('Profia'), ...getVehiclePresetDimensions('truck_10t', 'wing_body') }));
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: editVehicleData?.model === 'Profia' ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: editVehicleData?.model === 'Profia' ? '1px solid #30D158' : '1px solid var(--glass-border)',
                    color: editVehicleData?.model === 'Profia' ? '#30D158' : 'var(--text-secondary)',
                    fontSize: '10.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Truck size={12} />
                  <span>HD Hino Profia (10t)</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setEditVehicleData(prev => ({ ...prev, make: 'Toyota', model: 'Harrier', type: 'car', bodyStyle: 'suv', photoUrl: getModelPresetImage('Harrier'), ...getVehiclePresetDimensions('car', 'suv') }));
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: editVehicleData?.model === 'Harrier' ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: editVehicleData?.model === 'Harrier' ? '1px solid #30D158' : '1px solid var(--glass-border)',
                    color: editVehicleData?.model === 'Harrier' ? '#30D158' : 'var(--text-secondary)',
                    fontSize: '10.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Zap size={12} />
                  <span>HD Toyota Harrier (SUV)</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setEditVehicleData(prev => ({ ...prev, make: 'Nissan', model: 'Skyline', type: 'car', bodyStyle: 'sedan', photoUrl: getModelPresetImage('Skyline'), ...getVehiclePresetDimensions('car', 'sedan') }));
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: editVehicleData?.model === 'Skyline' ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: editVehicleData?.model === 'Skyline' ? '1px solid #30D158' : '1px solid var(--glass-border)',
                    color: editVehicleData?.model === 'Skyline' ? '#30D158' : 'var(--text-secondary)',
                    fontSize: '10.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Zap size={12} />
                  <span>HD Nissan Skyline (Sedan)</span>
                </button>
              </div>
            </div>

            {/* Form inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{getProfileLangText('vehicleTypeLabel')}</label>
                <select 
                  value={editVehicleData.type}
                  onChange={e => {
                    const val = e.target.value;
                    let defaultStyle = 'sedan';
                    let mk = 'Toyota';
                    let md = 'Harrier';
                    
                    if (val === 'moto') { defaultStyle = 'scooter'; mk = 'Honda'; md = 'Super Cub'; }
                    else if (val === 'velo') { defaultStyle = 'standard'; mk = 'Bridgestone'; md = 'City Cycle'; }
                    else if (val === 'kei_truck') { defaultStyle = 'flatbed'; mk = 'Suzuki'; md = 'Carry'; }
                    else if (val === 'truck_2t') { defaultStyle = 'box_truck'; mk = 'Isuzu'; md = 'Elf'; }
                    else if (val === 'truck_3t') { defaultStyle = 'box_truck'; mk = 'Isuzu'; md = 'Elf'; }
                    else if (val === 'truck_4t') { defaultStyle = 'wing_body'; mk = 'Hino'; md = 'Ranger'; }
                    else if (val === 'truck_10t') { defaultStyle = 'wing_body'; mk = 'Isuzu'; md = 'Giga'; }
                    else if (val === 'trailer') { defaultStyle = 'trailer_container'; mk = 'Mitsubishi Fuso'; md = 'Super Great'; }
                    else if (val === 'tanker') { defaultStyle = 'box_truck'; mk = 'UD Quon'; md = 'Chemical Tanker'; }
                    else if (val === 'bus') { defaultStyle = 'standard'; mk = 'Isuzu'; md = 'Gala'; }
                    
                    const dims = getVehiclePresetDimensions(val, defaultStyle);
                    
                    setEditVehicleData(prev => {
                      const next = { ...prev, type: val, make: mk, model: md, bodyStyle: defaultStyle, ...dims };
                      // Tur o'zgarsa eski modelning rasmi qolmaydi (foydalanuvchi rasmi bundan mustasno)
                      return { ...next, photoUrl: photoForIdentityChange(prev, next) };
                    });
                  }}
                  style={{
                    background: 'var(--card-bg, #2c2c2e)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '7px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  <option value="car">{getProfileLangText('type_car')}</option>
                  <option value="kei_truck">{getProfileLangText('type_kei_truck')}</option>
                  <option value="truck_2t">{getProfileLangText('type_truck_2t')}</option>
                  <option value="truck_3t">{getProfileLangText('type_truck_3t')}</option>
                  <option value="truck_4t">{getProfileLangText('type_truck_4t')}</option>
                  <option value="truck_10t">{getProfileLangText('type_truck_10t')}</option>
                  <option value="trailer">{getProfileLangText('type_trailer')}</option>
                  <option value="tanker">{getProfileLangText('type_tanker')}</option>
                  <option value="moto">{getProfileLangText('type_moto')}</option>
                  <option value="velo">{getProfileLangText('type_velo')}</option>
                  <option value="bus">{getProfileLangText('type_bus')}</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{getProfileLangText('vehicleBodyStyleLabel')}</label>
                <select
                  value={editVehicleData.bodyStyle}
                  onChange={e => {
                    const val = e.target.value;
                    const dims = getVehiclePresetDimensions(editVehicleData.type, val);
                    setEditVehicleData(prev => ({ 
                      ...prev, 
                      bodyStyle: val,
                      ...dims
                    }));
                  }}
                  style={{
                    background: 'var(--card-bg, #2c2c2e)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '7px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  {editVehicleData.type === 'car' && (
                    <>
                      <option value="sedan">{getProfileLangText('body_sedan')}</option>
                      <option value="hatchback">{getProfileLangText('body_hatchback')}</option>
                      <option value="suv">{getProfileLangText('body_suv')}</option>
                      <option value="minivan">{getProfileLangText('body_minivan')}</option>
                    </>
                  )}
                  {editVehicleData.type === 'moto' && (
                    <>
                      <option value="scooter">{getProfileLangText('body_scooter')}</option>
                      <option value="sportbike">{getProfileLangText('body_sportbike')}</option>
                    </>
                  )}
                  {editVehicleData.type === 'velo' && <option value="standard">{getProfileLangText('body_standard')}</option>}
                  {editVehicleData.type === 'truck_3t' && (
                    <>
                      <option value="flatbed">{getProfileLangText('body_flatbed')}</option>
                      <option value="box_truck">{getProfileLangText('body_box_truck')}</option>
                    </>
                  )}
                  {editVehicleData.type === 'truck_4t' && (
                    <>
                      <option value="flatbed">{getProfileLangText('body_flatbed')}</option>
                      <option value="box_truck">{getProfileLangText('body_box_truck')}</option>
                      <option value="wing_body">{getProfileLangText('body_wing_body')}</option>
                      <option value="dump_truck">{getProfileLangText('body_dump_truck')}</option>
                    </>
                  )}
                  {editVehicleData.type === 'trailer' && <option value="trailer_container">{getProfileLangText('body_trailer_container')}</option>}
                  {editVehicleData.type === 'bus' && <option value="standard">{getProfileLangText('body_standard')}</option>}
                </select>
              </div>

              <InlineCustomSelect
                label={t('vehicleMake')}
                value={editVehicleData.make}
                options={ALL_GLOBAL_BRANDS}
                onChange={(val) => {
                  let defaultModel = val === 'Boshqa' ? '' : 'Other';
                  let defaultBody = editVehicleData.bodyStyle || 'sedan';
                  
                  const preset = MASTER_VEHICLE_DATABASE.find(v => v.make.toLowerCase() === val.toLowerCase());
                  if (preset) {
                    defaultModel = preset.model;
                    defaultBody = preset.bodyStyle;
                  }

                  const dims = getVehiclePresetDimensions(editVehicleData.type, defaultBody);
                  // Tarmoq so'rovi yo'q: rasm bo'lmasa konstruktor effekti (debounce) HD rasmni topadi
                  setEditVehicleData(prev => {
                    const next = { ...prev, make: val, model: defaultModel, bodyStyle: defaultBody, ...dims };
                    return { ...next, photoUrl: preset?.photoUrl || photoForIdentityChange(prev, next) };
                  });
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%', boxSizing: 'border-box' }}>
                {editVehicleData.make !== 'Boshqa' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <InlineCustomSelect
                      label={t('vehicleModel')}
                      value={editVehicleData.model}
                      options={dynamicModels.length > 0 ? dynamicModels : ['Other']}
                      onChange={(val) => {
                        const preset = MASTER_VEHICLE_DATABASE.find(
                          v => v.make.toLowerCase() === editVehicleData.make.toLowerCase() && v.model.toLowerCase() === val.toLowerCase()
                        );
                        let matchedBody = preset?.bodyStyle || editVehicleData.bodyStyle;
                        const dims = getVehiclePresetDimensions(editVehicleData.type, matchedBody);
                        setEditVehicleData(prev => {
                          const next = { ...prev, model: val, bodyStyle: matchedBody, ...dims };
                          return { ...next, photoUrl: preset?.photoUrl || photoForIdentityChange(prev, next) };
                        });
                      }}
                    />

                    {editVehicleData.model === 'Other' && (
                      <input 
                        type="text"
                        placeholder={tx({ ja: 'モデル名を入力 (例: スカイライン, スープラ...)', en: 'Enter model name (e.g. Skyline, Supra...)', uz: 'Model nomini kiriting (masalan: Skyline, Supra...)', ru: 'Введите название модели (например: Skyline, Supra...)', zh: '请输入车型名称（例如：Skyline、Supra...）', vi: 'Nhập tên mẫu xe (ví dụ: Skyline, Supra...)', ne: 'मोडेलको नाम प्रविष्ट गर्नुहोस् (उदाहरण: Skyline, Supra...)' })}
                        onChange={(e) => {
                          const customModel = e.target.value;
                          // Har bir harf uchun so'rov yuborilmaydi — konstruktor effekti 600ms debounce bilan qidiradi
                          setEditVehicleData(prev => {
                            const next = { ...prev, model: customModel };
                            return { ...next, photoUrl: photoForIdentityChange(prev, next) };
                          });
                        }}
                        style={{
                          background: 'var(--card-bg, #ffffff)',
                          color: 'var(--text-main, #000000)',
                          border: '1px solid var(--glass-border, #d1d1d6)',
                          borderRadius: '8px',
                          padding: '7px',
                          fontSize: '12px',
                          outline: 'none',
                          marginTop: '4px',
                          maxWidth: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleModel')}</label>
                    <input 
                      type="text"
                      placeholder={modelInputPlaceholder}
                      value={editVehicleData.model}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditVehicleData(prev => {
                          const next = { ...prev, model: val };
                          return { ...next, photoUrl: photoForIdentityChange(prev, next) };
                        });
                      }}
                      style={{
                        background: 'var(--card-bg, #ffffff)',
                        color: 'var(--text-main, #000000)',
                        border: '1px solid var(--glass-border, #d1d1d6)',
                        borderRadius: '8px',
                        padding: '7px',
                        fontSize: '13px',
                        outline: 'none',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                )}
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  {getProfileLangText('constructorTitle')}
                </span>
                
                {/* Datalist containing ALL 100+ Japanese Plate Offices */}
                <datalist id="jdm-prefectures">
                  {/* Hokkaido */}
                  <option value="札幌" /><option value="函館" /><option value="旭川" /><option value="室蘭" /><option value="釧路" /><option value="帯広" /><option value="北見" /><option value="小樽" /><option value="苫小牧" /><option value="知床" />
                  {/* Tohoku */}
                  <option value="青森" /><option value="八戸" /><option value="盛岡" /><option value="岩手" /><option value="平泉" /><option value="仙台" /><option value="宮城" /><option value="秋田" /><option value="山形" /><option value="庄内" /><option value="福島" /><option value="会津" /><option value="郡山" /><option value="いわき" />
                  {/* Kanto */}
                  <option value="水戸" /><option value="土浦" /><option value="つくば" /><option value="宇都宮" /><option value="とちぎ" /><option value="那須" /><option value="前橋" /><option value="高崎" /><option value="群馬" /><option value="大宮" /><option value="熊谷" /><option value="川口" /><option value="所沢" /><option value="川越" /><option value="春日部" /><option value="越谷" /><option value="千葉" /><option value="成田" /><option value="習志野" /><option value="袖ヶ浦" /><option value="野田" /><option value="柏" /><option value="松戸" /><option value="市川" /><option value="船橋" /><option value="市原" /><option value="品川" /><option value="世田谷" /><option value="練馬" /><option value="杉並" /><option value="板橋" /><option value="足立" /><option value="江東" /><option value="葛飾" /><option value="八王子" /><option value="多摩" /><option value="横浜" /><option value="川崎" /><option value="相模" /><option value="湘南" /><option value="小田原" />
                  {/* Chubu */}
                  <option value="新潟" /><option value="長岡" /><option value="上越" /><option value="富山" /><option value="金沢" /><option value="石川" /><option value="福井" /><option value="山梨" /><option value="富士山" /><option value="長野" /><option value="松本" /><option value="諏訪" /><option value="岐阜" /><option value="飛騨" /><option value="静岡" /><option value="沼津" /><option value="浜松" /><option value="伊豆" /><option value="豊橋" /><option value="岡崎" /><option value="豊田" /><option value="名古屋" /><option value="尾張小牧" /><option value="一宮" /><option value="春日井" /><option value="三河" /><option value="津" /><option value="鈴鹿" /><option value="四日市" /><option value="伊勢志摩" />
                  {/* Kinki */}
                  <option value="滋賀" /><option value="京都" /><option value="大阪" /><option value="なにわ" /><option value="和泉" /><option value="堺" /><option value="飛鳥" /><option value="奈良" /><option value="橿原" /><option value="神戸" /><option value="姫路" /><option value="尼崎" /><option value="和歌山" />
                  {/* Chugoku & Shikoku */}
                  <option value="鳥取" /><option value="島根" /><option value="出雲" /><option value="岡山" /><option value="倉敷" /><option value="広島" /><option value="福山" /><option value="下関" /><option value="山口" /><option value="徳島" /><option value="香川" /><option value="高松" /><option value="愛媛" /><option value="高知" />
                  {/* Kyushu & Okinawa */}
                  <option value="福岡" /><option value="久留米" /><option value="北九州" /><option value="筑豊" /><option value="佐賀" /><option value="長崎" /><option value="佐世保" /><option value="熊本" /><option value="大分" /><option value="宮崎" /><option value="鹿児島" /><option value="奄美" /><option value="沖縄" /><option value="宮古" /><option value="八重山" />
                </datalist>

                {/* 2-Column Grid for JDM Plate Constructor Input Fields */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  {/* Prefecture Text Input (Auto-complete linked to datalist) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('prefectureLabel')}</label>
                    <input 
                      type="text"
                      list="jdm-prefectures"
                      placeholder="練馬, 松戸, 品川..."
                      maxLength="4"
                      value={editVehicleData.platePrefecture || ''}
                      onChange={e => setEditVehicleData(prev => ({ ...prev, platePrefecture: e.target.value.trim().slice(0, 4) }))}
                      style={{
                        background: 'var(--card-bg, #2c2c2e)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '13px',
                        outline: 'none',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Class Code */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('classCodeLabel')}</label>
                    <input 
                      type="text" 
                      maxLength="3"
                      placeholder="300"
                      value={editVehicleData.plateClass || ''}
                      onChange={e => setEditVehicleData(prev => ({ ...prev, plateClass: e.target.value.replace(/\D/g, '') }))}
                      style={{
                        background: 'var(--card-bg, #2c2c2e)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '13px',
                        outline: 'none',
                        textAlign: 'center',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Hiragana Select */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('hiraLabel')}</label>
                    <select 
                      value={editVehicleData.plateHira || 'あ'}
                      onChange={e => setEditVehicleData(prev => ({ ...prev, plateHira: e.target.value }))}
                      style={{
                        background: 'var(--card-bg, #2c2c2e)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '13px',
                        outline: 'none',
                        width: '100%',
                        boxSizing: 'border-box',
                        height: '37px'
                      }}
                    >
                      {JDM_HIRAGANA.map(hira => <option key={hira} value={hira}>{hira}</option>)}
                    </select>
                  </div>

                  {/* 4 Digit Main Number */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('numLabel')}</label>
                    <input 
                      type="text" 
                      placeholder="12-34"
                      value={editVehicleData.plateNumber || ''}
                      onChange={e => {
                        let val = e.target.value.replace(/[^\d-]/g, '');
                        if (val.length === 4 && !val.includes('-')) {
                          val = val.slice(0, 2) + '-' + val.slice(2);
                        }
                        setEditVehicleData(prev => ({ ...prev, plateNumber: val }));
                      }}
                      style={{
                        background: 'var(--card-bg, #2c2c2e)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '13px',
                        outline: 'none',
                        textAlign: 'center',
                        letterSpacing: '1px',
                        fontWeight: 'bold',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* JDM Plate design selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{getProfileLangText('plateDesignLabel')}</label>
                  <select
                    value={editVehicleData.plateType || 'private'}
                    onChange={e => {
                      const val = e.target.value;
                      setEditVehicleData(prev => ({ 
                        ...prev, 
                        plateType: val,
                        isCommercial: val === 'commercial' || val === 'kei_commercial'
                      }));
                    }}
                    style={{
                      background: 'var(--card-bg, #2c2c2e)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="private">{getProfileLangText('opt_private')}</option>
                    <option value="commercial">{getProfileLangText('opt_commercial')}</option>
                    <option value="kei_private">{getProfileLangText('opt_kei_private')}</option>
                    <option value="kei_commercial">{getProfileLangText('opt_kei_commercial')}</option>
                    <option value="illustrated_fuji">{getProfileLangText('opt_illustrated_fuji')}</option>
                    <option value="illustrated_expo">{getProfileLangText('opt_illustrated_expo')}</option>
                    <option value="illustrated_flower">{getProfileLangText('opt_illustrated_flower')}</option>
                    <option value="illustrated_matsudo">{getProfileLangText('opt_illustrated_matsudo')}</option>
                  </select>
                </div>

                {/* Driver Mark badge selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{getProfileLangText('driverBadgeLabel')}</label>
                  <select
                    value={editVehicleData.driverMark || 'none'}
                    onChange={e => setEditVehicleData(prev => ({ ...prev, driverMark: e.target.value }))}
                    style={{
                      background: 'var(--card-bg, #2c2c2e)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="none">{getProfileLangText('opt_badge_none')}</option>
                    <option value="beginner">{getProfileLangText('opt_badge_beginner')}</option>
                    <option value="elderly">{getProfileLangText('opt_badge_elderly')}</option>
                    <option value="disabled">{getProfileLangText('opt_badge_disabled')}</option>
                    <option value="hearing">{getProfileLangText('opt_badge_hearing')}</option>
                  </select>
                </div>
              </div>

              {/* Color picker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleColor')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="color" 
                    value={editVehicleData.color} 
                    onChange={e => setEditVehicleData(prev => ({ ...prev, color: e.target.value }))}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'none',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer'
                    }}
                  />
                  {/* Preset color chips */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { hex: '#5E5CE6', name: 'Indigo' },
                      { hex: '#F2F2F7', name: 'Pearl White' },
                      { hex: '#1C1C1E', name: 'Obsidian' },
                      { hex: '#FF3B30', name: 'Red' },
                      { hex: '#FF9F0A', name: 'Orange' },
                      { hex: '#34C759', name: 'Green' },
                      { hex: '#8E8E93', name: 'Silver' },
                      { hex: '#0A84FF', name: 'Blue' }
                    ].map(chip => (
                      <button
                        key={chip.hex}
                        type="button"
                        onClick={() => setEditVehicleData(prev => ({ ...prev, color: chip.hex }))}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: chip.hex,
                          border: editVehicleData.color === chip.hex ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease',
                          boxShadow: editVehicleData.color === chip.hex ? '0 0 6px var(--primary)' : 'none'
                        }}
                        title={chip.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Editable Vehicle Dimensions Grid */}
              <div style={{
                gridColumn: 'span 2',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '12px',
                marginTop: '8px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  📐 {getProfileLangText('vehicleDimensionsLabel')}
                </span>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('heightLabel')} (m)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={editVehicleData.height || ''}
                      onChange={e => setEditVehicleData(prev => ({ ...prev, height: e.target.value }))}
                      style={{
                        background: 'var(--card-bg, #2c2c2e)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '7px',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('widthLabel')} (m)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={editVehicleData.width || ''}
                      onChange={e => setEditVehicleData(prev => ({ ...prev, width: e.target.value }))}
                      style={{
                        background: 'var(--card-bg, #2c2c2e)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '7px',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('lengthLabel')} (m)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={editVehicleData.length || ''}
                      onChange={e => setEditVehicleData(prev => ({ ...prev, length: e.target.value }))}
                      style={{
                        background: 'var(--card-bg, #2c2c2e)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '7px',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('weightLabel')} (t)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={editVehicleData.weight || ''}
                      onChange={e => setEditVehicleData(prev => ({ ...prev, weight: e.target.value }))}
                      style={{
                        background: 'var(--card-bg, #2c2c2e)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '7px',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('axleLoadLabel')} (t)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={editVehicleData.axleLoad || ''}
                      onChange={e => setEditVehicleData(prev => ({ ...prev, axleLoad: e.target.value }))}
                      style={{
                        background: 'var(--card-bg, #2c2c2e)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '7px',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>

                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('minTurnRadiusLabel')} (m)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={editVehicleData.minTurnRadius || ''}
                      onChange={e => setEditVehicleData(prev => ({ ...prev, minTurnRadius: e.target.value }))}
                      style={{
                        background: 'var(--card-bg, #2c2c2e)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '7px',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  className="profile-btn-interactive"
                  style={{
                    background: 'rgba(255, 69, 58, 0.12)',
                    border: '1px solid rgba(255, 69, 58, 0.3)',
                    color: '#FF453A',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '12.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    gridColumn: 'span 2',
                    marginTop: '6px'
                  }}
                  onClick={() => setVehicleClearConfirm(true)}
                >
                  🗑️ {tx({ ja: '自家用車なしに設定 (全削除)', en: 'Set No Personal Vehicle (Remove All)', uz: 'Shaxsiy transportim yoʻq (Umuman oʻchirish)', ru: 'Указать «нет личного авто» (удалить все)', zh: '设为无私家车（全部删除）', vi: 'Đặt là không có xe cá nhân (Xóa tất cả)', ne: 'व्यक्तिगत सवारी छैन भनी सेट गर्नुहोस् (सबै हटाउनुहोस्)' })}
                </button>
              </div>

              {/* Action Buttons Row at the bottom of the form (Prevents Header Horizontal Clutter) */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', width: '100%', gridColumn: 'span 2', boxSizing: 'border-box' }}>
                <button 
                  type="button"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.15), rgba(255, 45, 85, 0.15))',
                    border: '1px solid rgba(255, 59, 48, 0.3)',
                    color: '#FF453A',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onClick={() => setIsEditingVehicle(false)}
                >
                  ❌ {t('cancel')}
                </button>
                <button 
                  type="button"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0A84FF, #007AFF)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(10, 132, 255, 0.3)'
                  }}
                  id="vehicle-save-btn"
                  onClick={handleSaveVehicle}
                >
                  💾 {t('save')}
                </button>
              </div>

            </div>
          )}
      </div>
    </div>
  );
}
