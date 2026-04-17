
-- ===== ROLES =====
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== TIMESTAMP TRIGGER =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ===== INSTITUTE INFO (singleton) =====
CREATE TABLE public.institute_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_description TEXT,
  about TEXT,
  mission TEXT,
  vision TEXT,
  values_text TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  business_hours TEXT,
  president_name TEXT,
  cnpj TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.institute_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view institute info"
  ON public.institute_info FOR SELECT
  USING (true);

CREATE POLICY "Admins can update institute info"
  ON public.institute_info FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert institute info"
  ON public.institute_info FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_institute_info_updated
  BEFORE UPDATE ON public.institute_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial institute info
INSERT INTO public.institute_info (name, short_description, about, mission, vision, values_text, address, phone, email, business_hours)
VALUES (
  'Instituto de Previdência Própria',
  'Garantindo o futuro dos servidores públicos com transparência, segurança e responsabilidade.',
  'O Instituto de Previdência Própria é a entidade responsável pela gestão do Regime Próprio de Previdência Social (RPPS), assegurando os benefícios previdenciários dos servidores públicos efetivos e de seus dependentes. Atuamos com compromisso, transparência e excelência na administração dos recursos previdenciários.',
  'Assegurar o equilíbrio financeiro e atuarial do regime próprio, garantindo o pagamento dos benefícios previdenciários aos servidores e seus dependentes com eficiência, transparência e responsabilidade social.',
  'Ser referência nacional em gestão previdenciária pública, reconhecida pela excelência no atendimento, sustentabilidade financeira e compromisso com seus segurados.',
  'Transparência, Ética, Responsabilidade, Eficiência, Compromisso Social e Respeito ao Servidor.',
  'Rua Exemplo, 123 — Centro, Cidade — Estado, CEP 00000-000',
  '(00) 0000-0000',
  'contato@institutoprevidencia.gov.br',
  'Segunda a sexta, das 8h às 17h'
);

-- ===== NEWS =====
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_name TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_published_at ON public.news (published_at DESC);
CREATE INDEX idx_news_published ON public.news (published);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published news"
  ON public.news FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert news"
  ON public.news FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update news"
  ON public.news FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete news"
  ON public.news FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_news_updated
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed sample news
INSERT INTO public.news (slug, title, excerpt, content, author_name, published_at) VALUES
('reajuste-beneficios-2025', 'Reajuste dos benefícios previdenciários para 2025', 'Confira os novos valores aplicados aos benefícios pagos pelo instituto a partir de janeiro.', E'A partir de janeiro de 2025, os benefícios previdenciários administrados pelo Instituto serão reajustados conforme índice oficial.\n\nO reajuste atende ao disposto na legislação vigente e busca preservar o poder de compra dos segurados.\n\nMais informações estão disponíveis no setor de atendimento ao segurado.', 'Diretoria de Comunicação', now() - interval '2 days'),
('recadastramento-anual', 'Recadastramento anual de aposentados e pensionistas', 'O recadastramento é obrigatório e deve ser feito até o final do mês de aniversário do segurado.', E'O Instituto comunica a todos os aposentados e pensionistas a obrigatoriedade do recadastramento anual.\n\nO procedimento deve ser realizado até o último dia útil do mês de aniversário do segurado.\n\nA documentação necessária inclui documento oficial com foto, comprovante de residência atualizado e CPF.', 'Setor de Benefícios', now() - interval '7 days'),
('audiencia-publica-balanco', 'Audiência pública apresenta balanço financeiro do Instituto', 'Demonstrações contábeis e atuariais foram apresentadas à comunidade em sessão aberta.', E'Foi realizada na última semana a audiência pública de prestação de contas do Instituto.\n\nForam apresentados os resultados financeiros, o relatório atuarial e as ações desenvolvidas no período.\n\nA documentação completa está disponível no portal da transparência.', 'Conselho Fiscal', now() - interval '15 days');

-- ===== STORAGE: news images =====
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);

CREATE POLICY "News images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-images');

CREATE POLICY "Admins can upload news images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update news images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete news images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));
