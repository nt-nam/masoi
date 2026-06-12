// Ngân hàng câu tiếng Việt theo mẫu + slot (PLAN §8.4). {name} = tên người bị nhắc.

export const OPENERS = [
  'Đêm qua yên ắng quá, mọi người thấy sao?',
  'Có ai để ý được gì đêm qua không?',
  'Tôi chưa chắc ai đáng nghi, nghe mọi người nói đã.',
  'Hôm nay phải tìm cho ra Sói thôi.',
  'Mọi người đừng vội, suy luận từ từ.',
];

export const ACCUSE_LINES = [
  'Tôi thấy {name} hơi đáng nghi đó.',
  '{name} im lặng suốt, lạ lắm.',
  'Cứ nhìn cách {name} vote hôm qua mà xem.',
  'Trực giác tôi bảo {name} không phải dân thường.',
  'Nếu phải chọn, tôi nghiêng về {name}.',
];

export const DEFEND_LINES = [
  'Oan quá, tôi là dân thường mà!',
  'Nghi tôi là phí phiếu đó, Sói đang cười kìa.',
  'Tôi mà là Sói thì đã không nói thế này.',
  'Bình tĩnh, đừng dồn phiếu cho tôi vô ích.',
];

export const NEUTRAL_LINES = [
  'Tôi bỏ lượt, chưa có gì chắc chắn.',
  'Nghe mọi người nói xong tôi sẽ quyết.',
  'Cẩn thận kẻo treo nhầm dân.',
];

export function fillTemplate(template: string, name: string): string {
  return template.replaceAll('{name}', name);
}
