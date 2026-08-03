import React, { createContext, useCallback, useContext, useState, useMemo } from "react";

import type { ReactNode } from "react";
import type { ShotLabelKey } from "../types";

export type Language = "zh" | "en";

type OptionCategory =
  | "clothingStyle"
  | "clothingSeason"
  | "background"
  | "expression"
  | "pose"
  | "lighting"
  | "modelGender"
  | "imageModel";

type OptionLabelMap = Record<OptionCategory, Record<string, string>>;

const optionLabels: Record<Language, OptionLabelMap> = {
  zh: {
    clothingStyle: {
      "街頭風": "街頭風",
      "中性風": "中性風",
      "學院復興": "學院復興",
      "東方極簡": "東方極簡",
      "城市戶外": "城市戶外",
      "優雅正裝": "優雅正裝",
      "寬鬆通勤": "寬鬆通勤",
      "運動機能風": "運動機能風",
      "戶外休閒風": "戶外休閒風",
      "日系無印風": "日系無印風",
      "韓系KPOP風": "韓系KPOP風",
      "歐洲英倫風": "歐洲英倫風",
      "波希米亞風": "波希米亞風",
      "昭和復古風": "昭和復古風",
      "新中式風格": "新中式風格",
      "自行補充描述": "自行補充描述",
    },
    clothingSeason: {
      "春": "春",
      "夏": "夏",
      "秋": "秋",
      "冬": "冬",
      "雨季": "雨季",
      "雪季": "雪季",
      "叢林探險": "叢林探險",
      "熱帶島嶼": "熱帶島嶼",
      "極地嚴寒": "極地嚴寒",
      "自行補充描述": "自行補充描述",
    },
    background: {
      "時尚攝影棚": "時尚攝影棚",
      "專業攝影棚": "專業攝影棚",
      "渡假小木屋": "渡假小木屋",
      "豪華飯店套房": "豪華飯店套房",
      "工業風工作室": "工業風工作室",
      "高樓層奢華辦公室": "高樓層奢華辦公室",
      "禪風茶屋": "禪風茶屋",
      "百貨公司": "百貨公司",
      "藝術畫廊": "藝術畫廊",
      "兒童樂園": "兒童樂園",
      "傳統市場": "傳統市場",
      "夜店酒吧": "夜店酒吧",
      "美式咖啡館": "美式咖啡館",
      "日式居酒屋": "日式居酒屋",
      "台北信義區商圈": "台北信義區商圈",
      "九份山城老街": "九份山城老街",
      "懷舊眷村紅磚牆": "懷舊眷村紅磚牆",
      "大稻埕古蹟街區": "大稻埕古蹟街區",
      "阿里山雲海日出": "阿里山雲海日出",
      "花蓮太魯閣峽谷": "花蓮太魯閣峽谷",
      "墾丁南灣沙灘": "墾丁南灣沙灘",
      "日月潭湖光山色": "日月潭湖光山色",
      "東京澀谷站前": "東京澀谷站前",
      "京都清水寺": "京都清水寺",
      "大阪道頓堀夜景": "大阪道頓堀夜景",
      "奈良公園": "奈良公園",
      "富士山下河口湖": "富士山下河口湖",
      "北海道小樽運河": "北海道小樽運河",
      "沖繩萬座毛": "沖繩萬座毛",
      "箱根溫泉街": "箱根溫泉街",
      "白川鄉合掌村": "白川鄉合掌村",
      "嚴島神社海上鳥居": "嚴島神社海上鳥居",
      "伏見稻荷千本鳥居": "伏見稻荷千本鳥居",
      "北海道富良野薰衣草田": "北海道富良野薰衣草田",
      "銀山溫泉街景": "銀山溫泉街景",
      "姬路城白色天守閣": "姬路城白色天守閣",
      "江之島電鐵沿線海景": "江之島電鐵沿線海景",
      "金澤兼六園": "金澤兼六園",
      "京都嵐山竹林小徑": "京都嵐山竹林小徑",
      "青森奧入瀨溪流": "青森奧入瀨溪流",
      "長野輕井澤森林": "長野輕井澤森林",
      "廣島原爆圓頂": "廣島原爆圓頂",
      "高知桂濱海岸": "高知桂濱海岸",
      "鹿兒島櫻島火山": "鹿兒島櫻島火山",
      "新潟越後湯澤雪場": "新潟越後湯澤雪場",
      "首爾明洞購物街": "首爾明洞購物街",
      "首爾N首爾塔": "首爾N首爾塔",
      "濟州島城山日出峰": "濟州島城山日出峰",
      "釜山海雲台海水浴場": "釜山海雲台海水浴場",
      "首爾景福宮": "首爾景福宮",
      "南怡島水杉林道": "南怡島水杉林道",
      "首爾梨花女子大學": "首爾梨花女子大學",
      "濟州島漢拏山": "濟州島漢拏山",
      "慶州大陵苑": "慶州大陵苑",
      "首爾北村韓屋村": "首爾北村韓屋村",
      "首爾樂天世界室內樂園": "首爾樂天世界室內樂園",
      "首爾東大門設計廣場": "首爾東大門設計廣場",
      "首爾COEX星空圖書館": "首爾COEX星空圖書館",
      "北京故宮紫禁城": "北京故宮紫禁城",
      "萬里長城": "萬里長城",
      "上海外灘": "上海外灘",
      "西安兵馬俑": "西安兵馬俑",
      "蘇州園林": "蘇州園林",
      "杭州西湖": "杭州西湖",
      "成都大熊貓基地": "成都大熊貓基地",
      "桂林灕江": "桂林灕江",
      "張家界天門山": "張家界天門山",
      "拉薩布達拉宮": "拉薩布達拉宮",
      "黃山迎客松": "黃山迎客松",
      "麗江古城": "麗江古城",
      "敦煌莫高窟": "敦煌莫高窟",
      "九寨溝": "九寨溝",
      "北京天壇": "北京天壇",
      "曼谷大皇宮": "曼谷大皇宮",
      "柬埔寨吳哥窟": "柬埔寨吳哥窟",
      "越南下龍灣": "越南下龍灣",
      "峇里島度假村": "峇里島度假村",
      "泰國普吉島沙灘": "泰國普吉島沙灘",
      "印度泰姬瑪哈陵": "印度泰姬瑪哈陵",
      "埃及金字塔": "埃及金字塔",
      "紐約蘇活區街道": "紐約蘇活區街道",
      "洛杉磯好萊塢大道": "洛杉磯好萊塢大道",
      "舊金山金門大橋": "舊金山金門大橋",
      "亞利桑那大峽谷": "亞利桑那大峽谷",
      "黃刀鎮極光景觀": "黃刀鎮極光景觀",
      "芝加哥城市天際線": "芝加哥城市天際線",
      "加拿大班夫國家公園": "加拿大班夫國家公園",
      "夏威夷火山口": "夏威夷火山口",
      "阿拉斯加冰川": "阿拉斯加冰川",
      "倫敦泰晤士河畔": "倫敦泰晤士河畔",
      "巴黎路邊露天咖啡館": "巴黎路邊露天咖啡館",
      "巴黎盧浮宮金字塔": "巴黎盧浮宮金字塔",
      "梵蒂岡聖彼得大教堂": "梵蒂岡聖彼得大教堂",
      "法國尼斯蔚藍海岸": "法國尼斯蔚藍海岸",
      "羅馬競技場": "羅馬競技場",
      "威尼斯運河": "威尼斯運河",
      "瑞士阿爾卑斯山脈": "瑞士阿爾卑斯山脈",
      "希臘聖托里尼": "希臘聖托里尼",
      "挪威峽灣惡魔之舌": "挪威峽灣惡魔之舌",
      "北極研究基地": "北極研究基地",
      "巴塞隆納聖家堂": "巴塞隆納聖家堂",
      "阿姆斯特丹運河": "阿姆斯特丹運河",
      "柏林布蘭登堡門": "柏林布蘭登堡門",
      "維也納美泉宮": "維也納美泉宮",
      "布拉格查理大橋": "布拉格查理大橋",
      "布達佩斯多瑙河": "布達佩斯多瑙河",
      "冰島藍湖溫泉": "冰島藍湖溫泉",
      "愛丁堡城堡": "愛丁堡城堡",
      "里斯本貝倫塔": "里斯本貝倫塔",
      "巴塞隆納高第建築": "巴塞隆納高第建築",
      "德國新天鵝堡": "德國新天鵝堡",
      "米蘭大教堂": "米蘭大教堂",
      "西班牙阿爾罕布拉宮": "西班牙阿爾罕布拉宮",
      "葡萄牙波爾圖": "葡萄牙波爾圖",
      "英國多佛白崖": "英國多佛白崖",
      "英國巨石陣": "英國巨石陣",
      "蘇格蘭艾雷島": "蘇格蘭艾雷島",
      "法國波爾多葡萄酒莊": "法國波爾多葡萄酒莊",
      "尼加拉瓜瀑布": "尼加拉瓜瀑布",
      "加拿大太陽峰滑雪場": "加拿大太陽峰滑雪場",
      "美國黃石國家公園": "美國黃石國家公園",
      "紐約大都會藝術博物館": "紐約大都會藝術博物館",
      "紐約中央車站大廳": "紐約中央車站大廳",
      "拉斯維加斯威尼斯人酒店室內運河": "拉斯維加斯威尼斯人酒店室內運河",
      "芝加哥藝術博物館": "芝加哥藝術博物館",
      "智利復活島": "智利復活島",
      "澳洲十二使徒岩": "澳洲十二使徒岩",
      "澳洲大堡礁": "澳洲大堡礁",
      "澳洲烏魯魯": "澳洲烏魯魯",
      "紐西蘭米爾福德峽灣": "紐西蘭米爾福德峽灣",
      "紐西蘭皇后鎮": "紐西蘭皇后鎮",
      "秘魯馬丘比丘": "秘魯馬丘比丘",
      "巴西伊瓜蘇瀑布": "巴西伊瓜蘇瀑布",
      "阿根廷佩里托莫雷諾冰川": "阿根廷佩里托莫雷諾冰川",
      "厄瓜多加拉巴哥群島": "厄瓜多加拉巴哥群島",
      "玻利維亞烏尤尼鹽湖": "玻利維亞烏尤尼鹽湖",
      "南非好望角": "南非好望角",
      "坦尚尼亞塞倫蓋提草原": "坦尚尼亞塞倫蓋提草原",
      "辛巴威維多利亞瀑布": "辛巴威維多利亞瀑布",
      "納米比亞死亡谷": "納米比亞死亡谷",
      "摩洛哥撒哈拉沙漠": "摩洛哥撒哈拉沙漠",
      "馬達加斯加猴麵包樹大道": "馬達加斯加猴麵包樹大道",
      "自行補充描述": "自行補充描述",
    },
    expression: {
      "中性平靜，視線直視鏡頭": "中性平靜，視線直視鏡頭",
      "專業嚴肅，視線直視鏡頭": "專業嚴肅，視線直視鏡頭",
      "自信穩定，視線直視鏡頭": "自信穩定，視線直視鏡頭",
      "自然微笑，視線直視鏡頭": "自然微笑，視線直視鏡頭",
      "親切友善，視線直視鏡頭": "親切友善，視線直視鏡頭",
      "沉穩從容，視線看向商品或手部動作": "沉穩從容，視線看向商品或手部動作",
      "神情放鬆，視線看向側前方遠處": "神情放鬆，視線看向側前方遠處",
      "冷峻疏離，視線看向側前方遠處": "冷峻疏離，視線看向側前方遠處",
      "慵懶隨興，視線看向斜下方": "慵懶隨興，視線看向斜下方",
      "參考人物表情參考圖": "參考人物表情參考圖",
      "自行補充描述": "自行補充描述",
    },
    pose: {
      "雙手自然下垂，正面站立": "雙手自然下垂，正面站立",
      "單手叉腰，身體重心偏移": "單手叉腰，身體重心偏移",
      "側身站立，呈現身體側面線條": "側身站立，呈現身體側面線條",
      "雙手插口袋，自然站立": "雙手插口袋，自然站立",
      "單手輕撫頭髮，手臂形成開放構圖": "單手輕撫頭髮，手臂形成開放構圖",
      "坐在椅子上，雙腿交叉或自然併放": "坐在椅子上，雙腿交叉或自然併放",
      "正面坐姿，雙手自然放置於腿上": "正面坐姿，雙手自然放置於腿上",
      "側坐在椅邊或支撐面上，身體略為側向": "側坐在椅邊或支撐面上，身體略為側向",
      "背對鏡頭坐姿，扭轉上身呈現背部與側面": "背對鏡頭坐姿，扭轉上身呈現背部與側面",
      "背對鏡頭站立，眺望遠方": "背對鏡頭站立，眺望遠方",
      "背對鏡頭自然站立，呈現背影與服裝背面": "背對鏡頭自然站立，呈現背影與服裝背面",
      "模擬行走動態，身體微側": "模擬行走動態，身體微側",
      "雙手交叉於身前，站姿穩定": "雙手交叉於身前，站姿穩定",
      "坐在地面或矮凳上，雙腿屈膝收攏": "坐在地面或矮凳上，雙腿屈膝收攏",
      "隨性盤腿坐，身體略微後仰": "隨性盤腿坐，身體略微後仰",
      "正在使用商品（如揹起、調整、穿戴）": "正在使用商品（如揹起、調整、穿戴）",
      "展示商品細節（如拉開、掀起、調整）": "展示商品細節（如拉開、掀起、調整）",
      "雙手向上伸展，身體延展": "雙手向上伸展，身體延展",
      "側身站立，呈現肩線與身體側面結構": "側身站立，呈現肩線與身體側面結構",
      "雙手插口袋，自然穩定站立": "雙手插口袋，自然穩定站立",
      "雙手交叉於胸前，站姿穩定": "雙手交叉於胸前，站姿穩定",
      "坐在椅子上，雙腿自然交錯或張開": "坐在椅子上，雙腿自然交錯或張開",
      "側坐於椅邊，身體略為側向": "側坐於椅邊，身體略為側向",
      "模擬行走動態，步伐自然，身體微側": "模擬行走動態，步伐自然，身體微側",
      "斜靠牆面或支撐物，重心偏移": "斜靠牆面或支撐物，重心偏移",
      "背對鏡頭站立或坐姿，扭轉上身呈現背部與側面": "背對鏡頭站立或坐姿，扭轉上身呈現背部與側面",
      "展示商品細節（如調整、穿戴、揹起）": "正在使用商品（如調整、穿戴、揹起）",
      "展示商品細節（如拉開、整理、指示）": "展示商品細節（如拉開、整理、指示）",
      "參考人物姿勢參考圖": "參考人物姿勢參考圖",
      "自行補充描述": "自行補充描述",
    },
    lighting: {
      "柔和攝影棚光": "柔和攝影棚光",
      "柔和自然窗光": "柔和自然窗光",
      "林布蘭人像光": "林布蘭人像光",
      "夕陽黃金時刻": "夕陽黃金時刻",
      "正午烈陽硬光": "正午烈陽硬光",
      "陰雨雲霧柔光": "陰雨雲霧柔光",
      "雪地反射柔光": "雪地反射柔光",
      "明亮清新高調光": "明亮清新高調光",
      "質感深沉低調光": "質感深沉低調光",
      "不規則自然光影": "不規則自然光影",
      "自行補充描述": "自行補充描述",
    },
    modelGender: {
      "女性模特兒": "女性模特兒",
      "男性模特兒": "男性模特兒",
    },
    imageModel: {
      "gemini-2.5-flash-image": "Gemini 2.5 Flash（快速，經濟）",
      "gemini-3-pro-image": "Gemini 3 Pro（高品質，專業）",
    },
  },
  en: {
    clothingStyle: {
      "街頭風": "Street style",
      "中性風": "Gender-neutral style",
      "學院復興": "Academy revival",
      "東方極簡": "Eastern minimalism",
      "城市戶外": "Urban outdoor",
      "優雅正裝": "Elegant formal",
      "寬鬆通勤": "Relaxed commute",
      "運動機能風": "Athleisure",
      "戶外休閒風": "Outdoor casual",
      "日系無印風": "Japanese Muji style",
      "韓系KPOP風": "Korean K-pop style",
      "歐洲英倫風": "European British style",
      "波希米亞風": "Bohemian",
      "昭和復古風": "Showa retro style",
      "新中式風格": "New Chinese style",
      "自行補充描述": "Custom description",
    },
    clothingSeason: {
      "春": "Spring",
      "夏": "Summer",
      "秋": "Autumn",
      "冬": "Winter",
      "雨季": "Rainy season",
      "雪季": "Snow season",
      "叢林探險": "Jungle adventure",
      "熱帶島嶼": "Tropical island",
      "極地嚴寒": "Polar extreme cold",
      "自行補充描述": "Custom description",
    },
    background: {
      "時尚攝影棚": "Fashion photography studio",
      "專業攝影棚": "Professional photography studio",
      "渡假小木屋": "Vacation cabin",
      "豪華飯店套房": "Luxury hotel suite",
      "工業風工作室": "Industrial-style studio",
      "高樓層奢華辦公室": "High-rise luxury office",
      "禪風茶屋": "Zen-style tea house",
      "百貨公司": "Department store",
      "藝術畫廊": "Art gallery",
      "兒童樂園": "Amusement park",
      "傳統市場": "Traditional market",
      "夜店酒吧": "Nightclub bar",
      "美式咖啡館": "American café",
      "日式居酒屋": "Japanese izakaya",
      "台北信義區商圈": "Taipei Xinyi business district",
      "九份山城老街": "Jiufen mountain town old street",
      "懷舊眷村紅磚牆": "Retro Taiwanese military dependents' village",
      "大稻埕古蹟街區": "Dadaocheng historic district",
      "阿里山雲海日出": "Alishan sea of clouds sunrise",
      "花蓮太魯閣峽谷": "Hualien Taroko Gorge",
      "墾丁南灣沙灘": "Kenting South Bay beach",
      "日月潭湖光山色": "Sun Moon Lake scenery",
      "東京澀谷站前": "Tokyo Shibuya Station front",
      "京都清水寺": "Kyoto Kiyomizu-dera",
      "大阪道頓堀夜景": "Osaka Dotonbori night view",
      "奈良公園": "Nara Park",
      "富士山下河口湖": "Lake Kawaguchi below Mt. Fuji",
      "北海道小樽運河": "Hokkaido Otaru Canal",
      "沖繩萬座毛": "Okinawa Manzamo",
      "箱根溫泉街": "Hakone hot spring street",
      "白川鄉合掌村": "Shirakawa-go Gassho-zukuri village",
      "嚴島神社海上鳥居": "Itsukushima Shrine floating torii gate",
      "伏見稻荷千本鳥居": "Fushimi Inari thousand torii gates",
      "北海道富良野薰衣草田": "Hokkaido Furano lavender fields",
      "銀山溫泉街景": "Ginzan hot spring street scene",
      "姬路城白色天守閣": "Himeji Castle white keep",
      "江之島電鐵沿線海景": "Enoshima Electric Railway coastal view",
      "金澤兼六園": "Kanazawa Kenrokuen Garden",
      "京都嵐山竹林小徑": "Kyoto Arashiyama Bamboo Grove",
      "青森奧入瀨溪流": "Aomori Oirase Stream",
      "長野輕井澤森林": "Nagano Karuizawa forest",
      "廣島原爆圓頂": "Hiroshima Atomic Bomb Dome",
      "高知桂濱海岸": "Kochi Katsurahama coast",
      "鹿兒島櫻島火山": "Kagoshima Sakurajima volcano",
      "新潟越後湯澤雪場": "Niigata Echigo-Yuzawa ski resort",
      "首爾明洞購物街": "Seoul Myeongdong shopping street",
      "首爾N首爾塔": "Seoul N Seoul Tower",
      "濟州島城山日出峰": "Jeju Island Seongsan Ilchulbong",
      "釜山海雲台海水浴場": "Busan Haeundae Beach",
      "首爾景福宮": "Seoul Gyeongbokgung Palace",
      "南怡島水杉林道": "Nami Island metasequoia lane",
      "首爾梨花女子大學": "Seoul Ewha Womans University",
      "濟州島漢拏山": "Jeju Island Hallasan",
      "慶州大陵苑": "Gyeongju Daereungwon",
      "首爾北村韓屋村": "Seoul Bukchon Hanok Village",
      "首爾樂天世界室內樂園": "Seoul Lotte World indoor theme park",
      "首爾東大門設計廣場": "Seoul Dongdaemun Design Plaza",
      "首爾COEX星空圖書館": "Seoul COEX Starfield Library",
      "北京故宮紫禁城": "Beijing Forbidden City",
      "萬里長城": "Great Wall of China",
      "上海外灘": "Shanghai Bund",
      "西安兵馬俑": "Xi'an Terracotta Warriors",
      "蘇州園林": "Suzhou Gardens",
      "杭州西湖": "Hangzhou West Lake",
      "成都大熊貓基地": "Chengdu Giant Panda Base",
      "桂林灕江": "Guilin Li River",
      "張家界天門山": "Zhangjiajie Tianmen Mountain",
      "拉薩布達拉宮": "Lhasa Potala Palace",
      "黃山迎客松": "Huangshan Welcoming Pine",
      "麗江古城": "Lijiang Old Town",
      "敦煌莫高窟": "Dunhuang Mogao Caves",
      "九寨溝": "Jiuzhaigou Valley",
      "北京天壇": "Beijing Temple of Heaven",
      "曼谷大皇宮": "Bangkok Grand Palace",
      "柬埔寨吳哥窟": "Cambodia Angkor Wat",
      "越南下龍灣": "Vietnam Ha Long Bay",
      "峇里島度假村": "Bali resort",
      "泰國普吉島沙灘": "Thailand Phuket beach",
      "印度泰姬瑪哈陵": "India Taj Mahal",
      "埃及金字塔": "Egypt Pyramids",
      "紐約蘇活區街道": "New York SoHo district streets",
      "洛杉磯好萊塢大道": "Los Angeles Hollywood Boulevard",
      "舊金山金門大橋": "San Francisco Golden Gate Bridge",
      "亞利桑那大峽谷": "Arizona Grand Canyon",
      "黃刀鎮極光景觀": "Yellowknife aurora viewing",
      "芝加哥城市天際線": "Chicago city skyline",
      "加拿大班夫國家公園": "Canadian Banff National Park",
      "夏威夷火山口": "Hawaiian volcanic crater",
      "阿拉斯加冰川": "Alaska glaciers",
      "倫敦泰晤士河畔": "London Thames Riverside",
      "巴黎路邊露天咖啡館": "Paris sidewalk café",
      "巴黎盧浮宮金字塔": "Paris Louvre Pyramid",
      "梵蒂岡聖彼得大教堂": "Vatican St. Peter's Basilica",
      "法國尼斯蔚藍海岸": "France Nice Côte d'Azur",
      "羅馬競技場": "Roman Colosseum",
      "威尼斯運河": "Venice canals",
      "瑞士阿爾卑斯山脈": "Swiss Alps",
      "希臘聖托里尼": "Santorini, Greece",
      "挪威峽灣惡魔之舌": "Norway Trolltunga cliff",
      "北極研究基地": "Arctic research base",
      "巴塞隆納聖家堂": "Barcelona Sagrada Familia",
      "阿姆斯特丹運河": "Amsterdam canals",
      "柏林布蘭登堡門": "Berlin Brandenburg Gate",
      "維也納美泉宮": "Vienna Schönbrunn Palace",
      "布拉格查理大橋": "Prague Charles Bridge",
      "布達佩斯多瑙河": "Budapest Danube River",
      "冰島藍湖溫泉": "Iceland Blue Lagoon",
      "愛丁堡城堡": "Edinburgh Castle",
      "里斯本貝倫塔": "Lisbon Belém Tower",
      "巴塞隆納高第建築": "Barcelona Gaudí architecture",
      "德國新天鵝堡": "Germany Neuschwanstein Castle",
      "米蘭大教堂": "Milan Cathedral",
      "西班牙阿爾罕布拉宮": "Spain Alhambra",
      "葡萄牙波爾圖": "Portugal Porto",
      "英國多佛白崖": "UK White Cliffs of Dover",
      "英國巨石陣": "UK Stonehenge",
      "蘇格蘭艾雷島": "Scotland Islay Island",
      "法國波爾多葡萄酒莊": "France Bordeaux winery",
      "尼加拉瓜瀑布": "Niagara Falls",
      "加拿大太陽峰滑雪場": "Canada Sun Peaks Ski Resort",
      "美國黃石國家公園": "USA Yellowstone National Park",
      "紐約大都會藝術博物館": "New York Metropolitan Museum of Art",
      "紐約中央車站大廳": "New York Grand Central Terminal main concourse",
      "拉斯維加斯威尼斯人酒店室內運河": "Las Vegas Venetian Resort indoor canal",
      "芝加哥藝術博物館": "Chicago Art Institute",
      "智利復活島": "Chile Easter Island",
      "澳洲十二使徒岩": "Australia Twelve Apostles",
      "澳洲大堡礁": "Australia Great Barrier Reef",
      "澳洲烏魯魯": "Australia Uluru",
      "紐西蘭米爾福德峽灣": "New Zealand Milford Sound",
      "紐西蘭皇后鎮": "New Zealand Queenstown",
      "秘魯馬丘比丘": "Peru Machu Picchu",
      "巴西伊瓜蘇瀑布": "Brazil Iguazu Falls",
      "阿根廷佩里托莫雷諾冰川": "Argentina Perito Moreno Glacier",
      "厄瓜多加拉巴哥群島": "Ecuador Galapagos Islands",
      "玻利維亞烏尤尼鹽湖": "Bolivia Uyuni Salt Flat",
      "南非好望角": "South Africa Cape of Good Hope",
      "坦尚尼亞塞倫蓋提草原": "Tanzania Serengeti",
      "辛巴威維多利亞瀑布": "Zimbabwe Victoria Falls",
      "納米比亞死亡谷": "Namibia Deadvlei",
      "摩洛哥撒哈拉沙漠": "Morocco Sahara Desert",
      "馬達加斯加猴麵包樹大道": "Madagascar Avenue of the Baobabs",
      "自行補充描述": "Custom description",
    },
    expression: {
      "中性平靜，視線直視鏡頭": "Neutral calm, looking at camera",
      "專業嚴肅，視線直視鏡頭": "Professional serious, looking at camera",
      "自信穩定，視線直視鏡頭": "Confident steady, looking at camera",
      "自然微笑，視線直視鏡頭": "Natural smile, looking at camera",
      "親切友善，視線直視鏡頭": "Friendly, looking at camera",
      "沉穩從容，視線看向商品或手部動作": "Calm and composed, looking at product or hand movements",
      "神情放鬆，視線看向側前方遠處": "Relaxed expression, looking into distance ahead",
      "冷峻疏離，視線看向側前方遠處": "Cool and aloof, looking into distance ahead",
      "慵懶隨興，視線看向斜下方": "Lazy casual, looking down at an angle",
      "參考人物表情參考圖": "Refer to facial expression reference image",
      "自行補充描述": "Custom description",
    },
    pose: {
      "雙手自然下垂，正面站立": "Standing front-facing with arms naturally at sides",
      "單手叉腰，身體重心偏移": "One hand on hip, body weight shifted",
      "側身站立，呈現身體側面線條": "Standing sideways, showcasing body side profile",
      "雙手插口袋，自然站立": "Hands in pockets, standing naturally",
      "單手輕撫頭髮，手臂形成開放構圖": "Touching hair with one hand, arms forming open composition",
      "坐在椅子上，雙腿交叉或自然併放": "Sitting on a chair with legs crossed or naturally together",
      "正面坐姿，雙手自然放置於腿上": "Front-facing seated pose, hands naturally on legs",
      "側坐在椅邊或支撐面上，身體略為側向": "Sitting sideways on chair edge or support, body slightly angled",
      "背對鏡頭坐姿，扭轉上身呈現背部與側面": "Back-facing seated pose, torso twisted to show back and side",
      "模擬行走動態，身體微側": "Simulating walking motion, body slightly angled",
      "雙手交叉於身前，站姿穩定": "Arms crossed in front, stable standing pose",
      "坐在地面或矮凳上，雙腿屈膝收攏": "Sitting on ground or low stool, knees bent and drawn in",
      "隨性盤腿坐，身體略微後仰": "Casual cross-legged sit, body slightly leaning back",
      "正在使用商品（如揹起、調整、穿戴）": "Using the product (e.g., carrying, adjusting, wearing)",
      "展示商品細節（如拉開、掀起、調整）": "Highlighting product details (e.g., opening, lifting, adjusting)",
      "雙手向上伸展，身體延展": "Arms stretched upward, body extended",
      "側身站立，呈現肩線與身體側面結構": "Standing sideways, showcasing shoulder line and body side structure",
      "雙手插口袋，自然穩定站立": "Hands in pockets, standing naturally and stably",
      "雙手交叉於胸前，站姿穩定": "Arms crossed on chest, stable standing pose",
      "坐在椅子上，雙腿自然交錯或張開": "Sitting on a chair with legs naturally crossed or spread",
      "側坐於椅邊，身體略為側向": "Sitting sideways on chair edge, body slightly angled",
      "模擬行走動態，步伐自然，身體微側": "Simulating walking motion, natural stride, body slightly angled",
      "斜靠牆面或支撐物，重心偏移": "Leaning against wall or support, weight shifted",
      "背對鏡頭站立或坐姿，扭轉上身呈現背部與側面": "Back-facing standing or seated pose, torso twisted to show back and side",
      "背對鏡頭站立，眺望遠方": "Standing with back to camera, gazing into the distance",
      "背對鏡頭自然站立，呈現背影與服裝背面": "Standing with back to camera, showing back and back of outfit",
      "正在使用商品（如調整、穿戴、揹起）": "Using the product (e.g., adjusting, wearing, carrying)",
      "展示商品細節（如拉開、整理、指示）": "Highlighting product details (e.g., opening, arranging, pointing)",
      "參考人物姿勢參考圖": "Refer to human pose reference image",
      "自行補充描述": "Custom description",
    },
    lighting: {
      "柔和攝影棚光": "Soft studio lighting",
      "柔和自然窗光": "Soft natural window light",
      "林布蘭人像光": "Rembrandt portrait lighting",
      "夕陽黃金時刻": "Sunset golden hour",
      "正午烈陽硬光": "Harsh midday sunlight",
      "陰雨雲霧柔光": "Overcast misty soft light",
      "雪地反射柔光": "Snow-reflected soft light",
      "明亮清新高調光": "Bright fresh high-key lighting",
      "質感深沉低調光": "Deep texture low-key lighting",
      "不規則自然光影": "Irregular natural light and shadow",
      "自行補充描述": "Custom description",
    },
    modelGender: {
      "女性模特兒": "Female model",
      "男性模特兒": "Male model",
    },
    imageModel: {
      "gemini-2.5-flash-image": "Gemini 2.5 Flash (Fast, Economical)",
      "gemini-3-pro-image": "Gemini 3 Pro (High Quality, Professional)",
    },
  },
};

// 背景分類翻譯
const backgroundCategoryLabels: Record<Language, Record<string, string>> = {
  zh: {
    "台灣": "台灣",
    "日本": "日本",
    "韓國": "韓國",
    "中國": "中國",
    "歐洲": "歐洲",
    "北美": "北美",
    "東南亞": "東南亞",
    "自然奇觀": "自然奇觀",
    "室內棚拍": "室內棚拍",
    "商業空間": "商業空間",
  },
  en: {
    "台灣": "Taiwan",
    "日本": "Japan",
    "韓國": "South Korea",
    "中國": "China",
    "歐洲": "Europe",
    "北美": "North America",
    "東南亞": "Southeast Asia",
    "自然奇觀": "Natural Wonders",
    "室內棚拍": "Indoor Studio",
    "商業空間": "Commercial Space",
  },
};

interface HeaderTranslations {
  title: string;
  subtitle: string;
  welcome: (email: string) => string;
  credits: (remaining: number | null, isLoading: boolean) => string;
  logout: string;
  languageToggleLabel: string;
}

interface FormTranslations {
  title: string;
  productName: string;
  clothingStyle: string;
  clothingSeason: string;
  faceImage: string;
  objectImage: string;
  background: string;
  additionalDescription: string;
  additionalPlaceholder: string;
  enhanceDescription: string;
  enhancing: string;
  modelGender: string;
  expression: string;
  pose: string;
  lighting: string;
  aspectRatio: string;
  poseImage: string;
  expressionImage: string;
  angleImage: string;
  selectFile: string;
  generateButton: string;
  removeFile: string;
  generating: string;
  back: string;
  quickSelect: string;
  imageModel: string;
}

interface PromptDisplayTranslations {
  title: string;
  description: string;
  loadingTitle: string;
  loadingNote: string;
  errorTitle: string;
  copyPrompt: string;
  copied: string;
  togglePrompt: string;
  emptyTitle: string;
  emptyDescription: string;
  generateVideo: string;
  generatingVideo: string;
  downloadImageLabel: (label: string) => string;
  downloadVideoLabel: (label: string) => string;
  videoUnsupported: string;
  downloadImage: string;
  downloading: string;
  clickToEnlarge: string;
  downloadHint: string;
}

interface HistoryTranslations {
  title: string;
  loading: string;
  empty: string;
  restoreLabel: (productName: string) => string;
}

interface AuthTranslations {
  appTitle: string;
  loginTab: string;
  registerTab: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  loginButton: string;
  registerButton: string;
  forgotPassword: string;
  loginSuccess: string;
  registerSuccess: string;
  resetSuccess: string;
  emailRequired: string;
  passwordMismatch: string;
  genericError: string;
  changeToLogin: string;
  changeToRegister: string;
  submitting: string;
}

interface ErrorTranslations {
  mustLogin: string;
  missingApiKey: string;
  quotaExhausted: string;
  consumeFailed: string;
  apiNoImage: string;
  imageReadFailed: string;
  imageDownloadFailed: (status: number) => string;
  unknownShotFailure: string;
  general: string;
  videoDownloadFailed: (statusText: string) => string;
  insufficientImages: string;
}

interface AuthErrorTranslations {
  [key: string]: string;
}

interface VideoTranslations {
  unsupportedAspect: string;
  fetchImageFailed: string;
  generateFailed: string;
  missingDownloadLink: string;
}

interface Translations {
  languageName: string;
  toggleLabel: string;
  header: HeaderTranslations;
  form: FormTranslations;
  promptDisplay: PromptDisplayTranslations;
  history: HistoryTranslations;
  auth: AuthTranslations;
  errors: ErrorTranslations;
  video: VideoTranslations;
  authErrors: AuthErrorTranslations;
  shotLabels: Record<ShotLabelKey, string>;
  general: GeneralTranslations;
}

interface GeneralTranslations {
  initializing: string;
}

const quotaReminderZh = `您的免費生成次數已用完。

若生成的作品滿意，歡迎 FB 分享推薦 https://studio.icareu.tw/

本應用服務目前已於 GitHub 免費開源，歡迎自行部署。

使用時請遵守開源協議。

若有委外部署 or 客製化選項需求，請來信 flypig@icareu.tw`;

const quotaReminderEn = `Your free generation credits are used up.

If you like the results, please share them on Facebook to recommend https://studio.icareu.tw/

This application is open sourced on GitHub—feel free to self-host.

Please comply with the open-source license.

For deployment or customization services, email flypig@icareu.tw`;

const translations: Record<Language, Translations> = {
  zh: {
    "languageName": "繁體中文",
    "toggleLabel": "English",
    header: {
      "title": "電商人像攝影棚 v1.5",
      "subtitle": "專為電商產業所設計，一鍵生成專業人像攝影照",
      welcome: (email) => `歡迎，${email}`,
      credits: (remaining, isLoading) =>
        isLoading
          ? "讀取中..."
          : `剩餘生成次數：${remaining ?? 0}（每位新註冊使用者僅享 100 次）`,
      "logout": "登出",
      "languageToggleLabel": "English",
    },
    form: {
      "title": "客製化您的詠唱",
      "productName": "品牌商品名稱",
      "clothingStyle": "服裝風格",
      "clothingSeason": "服裝季節",
      "faceImage": "特定人物臉孔參考圖",
      "objectImage": "特定物品參考圖",
      "poseImage": "人物姿勢參考圖",
      "expressionImage": "人物表情參考圖",
      "angleImage": "攝影視角參考圖",
      "background": "背景環境描述",
      "additionalDescription": "補充描述 (可選)",
      "additionalPlaceholder": "例如：模特兒有著藍色眼睛和金色長髮、背景中有一隻黑色的貓",
      "enhanceDescription": "✨ AI 隨機生成/擴寫",
      "enhancing": "產生中...",
      "modelGender": "模特兒性別",
      "expression": "表情描述",
      "pose": "人物姿勢",
      "lighting": "光線描述",
      "aspectRatio": "圖片長寬比",
      "selectFile": "選擇檔案...",
      "generateButton": "產生圖片",
      "removeFile": "移除檔案",
      "generating": "正在產生圖片...",
      "back": "返回",
      "quickSelect": "快速選擇",
      "imageModel": "影像生成模型",
    },
    promptDisplay: {
      "title": "產生結果",
      "description": "AI 產生的三種不同視角圖片",
      "loadingTitle": "正在產生三種不同視角的圖片...",
      "loadingNote": "這可能需要一點時間，請稍候。",
      "errorTitle": "產生失敗",
      "copyPrompt": "複製詠唱",
      "copied": "已複製！",
      "togglePrompt": "顯示/隱藏詠唱內容",
      "emptyTitle": "圖片將會顯示在這裡",
      "emptyDescription": "點擊「產生圖片」按鈕開始。",
      "generateVideo": "生成影片 (Gemini Veo)",
      "generatingVideo": "正在生成影片...",
      "downloadImageLabel": (label) => `下載${label}圖片`,
      "downloadVideoLabel": (label) => `下載${label}影片`,
      "videoUnsupported": "此比例不支援影片生成",
      "downloadHint": "💡 提示：在圖片上按右鍵選擇「另存圖片」即可下載",
      "downloadImage": "下載圖片",
      "downloading": "下載中...",
      "clickToEnlarge": "點擊圖片可放大檢視",
    },
    history: {
      "title": "歷史紀錄",
      "loading": "載入中...",
      "empty": "尚無歷史紀錄。產生圖片後，紀錄將會顯示於此。",
      restoreLabel: (productName: string) => `還原紀錄：${productName}`,
    },
    auth: {
      "appTitle": "電商人像攝影棚",
      "loginTab": "登入",
      "registerTab": "註冊",
      "emailLabel": "電子郵件",
      "passwordLabel": "密碼",
      "confirmPasswordLabel": "確認密碼",
      "loginButton": "登入",
      "registerButton": "註冊帳號",
      "forgotPassword": "忘記密碼？寄送重設連結",
      "loginSuccess": "登入成功！",
      "registerSuccess": "註冊成功，已自動登入。",
      "resetSuccess": "已寄出密碼重設郵件，請檢查您的收件匣。",
      "emailRequired": "請先輸入您的電子郵件地址。",
      "passwordMismatch": "兩次輸入的密碼不一致，請重新確認。",
      "genericError": "操作失敗，請稍後再試。",
      "changeToLogin": "已有帳號？登入",
      "changeToRegister": "沒有帳號？立即註冊",
      "submitting": "請稍候...",
    },
    errors: {
      "mustLogin": "請先登入後再產生圖片。",
      "missingApiKey": "尚未設定 Gemini API Key，請於環境變數新增 VITE_API_KEY。",
      quotaExhausted: quotaReminderZh,
      "consumeFailed": "無法確認生成次數，請稍後再試。",
      "apiNoImage": "API 未回傳任何圖片資料，請稍後再試。",
      "imageReadFailed": "無法讀取圖片資料。",
      imageDownloadFailed: (status) => `無法下載生成圖片（HTTP ${status}）。`,
      "unknownShotFailure": "API 未能針對其中一個視角回傳圖片。",
      "general": "發生未知錯誤，請稍後再試。",
      videoDownloadFailed: (statusText) => `下載影片失敗: ${statusText}`,
      "insufficientImages": "圖片生成數量不足，請重試。",
    },
    video: {
      "unsupportedAspect": "此長寬比不支援動態影像，請調整為 16:9 或 9:16 後再試。",
      "fetchImageFailed": "下載圖片失敗，無法生成動畫。",
      "generateFailed": "影片生成過程中發生錯誤。",
      "missingDownloadLink": "無法取得影片下載連結。",
    },
    authErrors: {
      "auth/invalid-email": "電子郵件格式不正確，請重新輸入。",
      "auth/user-disabled": "此帳號已被停用，請聯絡管理員。",
      "auth/user-not-found": "找不到相符的帳號，請確認是否已註冊。",
      "auth/wrong-password": "帳號或密碼錯誤，請重新確認。",
      "auth/invalid-credential": "帳號或密碼錯誤，請重新確認。",
      "auth/email-already-in-use": "此電子郵件已被註冊，請直接登入或使用其他信箱。",
      "auth/weak-password": "密碼強度不足，請至少輸入六個字元。",
      "auth/generic": "操作失敗，請稍後再試。",
    },
    shotLabels: {
      "fullBody": "全身",
      "medium": "半身",
      "closeUp": "特寫",
      "specialAngle": "特殊視角",
    },
    general: {
      "initializing": "初始化中...",
    },
  },
  en: {
    "languageName": "English",
    "toggleLabel": "中文",
    header: {
      "title": "AI Digital Portrait Studio v1.5",
      "subtitle": "Designed for e-commerce—generate professional portrait shots in one click",
      welcome: (email) => `Welcome, ${email}`,
      credits: (remaining, isLoading) =>
        isLoading
          ? "Loading credits..."
          : `Remaining credits: ${remaining ?? 0} (each new user receives 100 free generations)`,
      "logout": "Sign out",
      "languageToggleLabel": "中文",
    },
    form: {
      "title": "Customize Your Prompt",
      "productName": "Product name",
      "clothingStyle": "Clothing style",
      "clothingSeason": "Season / climate",
      "faceImage": "Face reference",
      "objectImage": "Object reference",
      "poseImage": "Pose reference",
      "expressionImage": "Expression reference",
      "angleImage": "Angle reference",
      "background": "Background description",
      "additionalDescription": "Additional details (optional)",
      "additionalPlaceholder":
        "Example: the model has blue eyes and long blonde hair; a black cat appears in the background.",
      "enhanceDescription": "✨ AI Generate/Enhance",
      "enhancing": "Generating...",
      "modelGender": "Model gender",
      "expression": "Facial expression",
      "pose": "Pose",
      "lighting": "Lighting",
      "aspectRatio": "Image aspect ratio",
      "imageModel": "Image Generation Model",
      "selectFile": "Choose file...",
      "generateButton": "Generate images",
      "removeFile": "Remove file",
      "generating": "Generating...",
      "back": "Back",
      "quickSelect": "Quick Select",
    },
    promptDisplay: {
      "title": "Generation Results",
      "description": "Three different viewpoints generated by AI",
      "loadingTitle": "Generating three unique perspectives...",
      "loadingNote": "This may take a moment. Please hold on.",
      "errorTitle": "Generation failed",
      "copyPrompt": "Copy prompt",
      "copied": "Copied!",
      "togglePrompt": "Show / hide prompt",
      "emptyTitle": "Images will appear here",
      "emptyDescription": "Click \"Generate images\" to get started.",
      "generateVideo": "Generate Video (Gemini Veo)",
      "generatingVideo": "Generating video...",
      "downloadImageLabel": (label) => `Download ${label} image`,
      "downloadVideoLabel": (label) => `Download ${label} video`,
      "videoUnsupported": "Video generation not supported for this aspect ratio",
      "downloadHint": "💡 Tip: Right-click on the image and select \"Save image as\" to download",
      "downloadImage": "Download image",
      "downloading": "Downloading...",
      "clickToEnlarge": "Click image to enlarge",
    },
    history: {
      "title": "History",
      "loading": "Loading history...",
      "empty": "No history yet. Generate an image and your records will appear here.",
      restoreLabel: (productName: string) => `Restore record: ${productName}`,
    },
    auth: {
      "appTitle": "AI Digital Portrait Studio",
      "loginTab": "Sign in",
      "registerTab": "Register",
      "emailLabel": "Email",
      "passwordLabel": "Password",
      "confirmPasswordLabel": "Confirm password",
      "loginButton": "Sign in",
      "registerButton": "Create account",
      "forgotPassword": "Forgot password? Send reset link",
      "loginSuccess": "Signed in successfully!",
      "registerSuccess": "Registration complete. You are now signed in.",
      "resetSuccess": "Password reset email sent. Please check your inbox.",
      "emailRequired": "Please enter your email address first.",
      "passwordMismatch": "Passwords do not match. Please double-check.",
      "genericError": "The request failed. Please try again later.",
      "changeToLogin": "Already have an account? Sign in",
      "changeToRegister": "Need an account? Register now",
      "submitting": "Please wait...",
    },
    errors: {
      "mustLogin": "Please sign in before generating images.",
      "missingApiKey": "Gemini API key is missing. Define VITE_API_KEY in your environment variables.",
      quotaExhausted: quotaReminderEn,
      "consumeFailed": "Unable to verify remaining credits. Please try again later.",
      "apiNoImage": "The API returned no image data. Please try again later.",
      "imageReadFailed": "Failed to read the image data.",
      imageDownloadFailed: (status) =>
        `Unable to download one of the generated images (HTTP ${status}).`,
      "unknownShotFailure": "The API failed to return an image for one of the viewpoints.",
      "general": "An unexpected error occurred. Please try again later.",
      videoDownloadFailed: (statusText) => `Failed to download video: ${statusText}`,
      "insufficientImages": "Not enough images were generated. Please try again.",
    },
    video: {
      "unsupportedAspect":
        "Motion clips support only 16:9 or 9:16. Please adjust the aspect ratio and try again.",
      "fetchImageFailed": "Failed to download the image required for animation.",
      "generateFailed": "Video generation failed.",
      "missingDownloadLink": "Unable to retrieve the video download link.",
    },
    authErrors: {
      "auth/invalid-email": "The email address format is invalid.",
      "auth/user-disabled": "This account has been disabled. Please contact support.",
      "auth/user-not-found": "No account found. Please sign up first.",
      "auth/wrong-password": "Incorrect email or password. Please try again.",
      "auth/invalid-credential": "Incorrect email or password. Please try again.",
      "auth/email-already-in-use": "This email is already registered. Please sign in.",
      "auth/weak-password": "Password is too weak. Please use at least six characters.",
      "auth/generic": "The request failed. Please try again later.",
    },
    shotLabels: {
      "fullBody": "Full Body",
      "medium": "Medium Shot",
      "closeUp": "Close-up",
      "specialAngle": "Special Angle",
    },
    general: {
      "initializing": "Initializing...",
    },
  },
};

interface TranslationContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  translateOption: (category: OptionCategory, value: string) => string;
  translateShotLabel: (key: ShotLabelKey) => string;
  translateCategory: (category: string) => string;
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("zh");

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "zh" ? "en" : "zh"));
  }, []);

  const value = useMemo<TranslationContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: translations[language],
      translateOption: (category, value) =>
        optionLabels[language][category][value] ?? value,
      translateShotLabel: (key) => translations[language].shotLabels[key] ?? key,
      translateCategory: (category) =>
        backgroundCategoryLabels[language][category] ?? category,
    }),
    [language]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
