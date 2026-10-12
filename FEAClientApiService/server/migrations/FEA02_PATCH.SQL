cp backup.sql backup.fixed.sql

sed -i 's/v_user user;/v_user public."user"%ROWTYPE;/g' backup.fixed.sql
sed -i 's/FROM user/FROM public."user"/g' backup.fixed.sql
sed -i 's/INSERT INTO user/INSERT INTO public."user"/g' backup.fixed.sql
sed -i 's/UPDATE user/UPDATE public."user"/g' backup.fixed.sql
sed -i 's/RETURNS public\.user/RETURNS public."user"/g' backup.fixed.sql
sed -i 's/CREATE TABLE public\.user/CREATE TABLE public."user"/g' backup.fixed.sql
sed -i 's/ALTER TABLE public\.user/ALTER TABLE public."user"/g' backup.fixed.sql
sed -i 's/ALTER TABLE ONLY public\.user/ALTER TABLE ONLY public."user"/g' backup.fixed.sql
sed -i 's/COPY public\.user/COPY public."user"/g' backup.fixed.sql
sed -i 's/REFERENCES public\.user(/REFERENCES public."user"(/g' backup.fixed.sql
